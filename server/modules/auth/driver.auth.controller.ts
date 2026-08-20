import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import redis from "../../lib/redis";
import prisma from "../../utils/prisma";
import { deleteOtp, generateOtp, getOtp, saveOtp } from "../../utils/otp";
import { sendOtpEmail } from "../../services/email.service";

const JWT_SECRET = process.env.JWT_SECRET as string;

// @desc: SEND OTP FOR LOGIN
// path: POST /api/v1/driver/auth/send-otp

export async function sendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Driver must already exist for login
    const driver = await prisma.driver.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not registered. Please register first.",
      });
    }

    // Check if OTP already exists
    const key = `otp:${normalizedEmail}`;
    const existingOtp = await redis.get(key);

    if (existingOtp) {
      return res.status(200).json({
        success: true,
        message: "OTP already sent. Please check your email.",
      });
    }

    // Generate OTP
    const otp = generateOtp();

    // Save OTP in Redis
    await saveOtp(normalizedEmail, otp);

    // Send OTP
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
}

// @desc: VERIFY OTP FOR LOGIN
// path: POST /api/v1/driver/auth/verify-otp

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get OTP from Redis
    const storedOtp = await getOtp(normalizedEmail);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or does not exist.",
      });
    }

    // Compare OTP
    if (storedOtp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // OTP can only be used once
    await deleteOtp(normalizedEmail);

    // Find driver
    const driver = await prisma.driver.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not registered. Please register first.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        driverId: driver.id,
        email: driver.email,
        role: "driver",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      driver,
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
}

// @desc: SEND OTP FOR REGISTRATION
// path: POST /api/v1/driver/auth/send-registration-otp

export async function sendRegistrationOtp(req: Request, res: Response) {
  try {
    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registeration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = req.body.driver;

    if (
      !name ||
      !country ||
      !phone_number ||
      !email ||
      !vehicle_type ||
      !registeration_number ||
      !driving_license
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if driver already exists
    const existingDriver = await prisma.driver.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: "Driver already registered. Please login.",
      });
    }

    const key = `otp:${email}`;
    const existingOtp = await redis.get(key);

    if (existingOtp) {
      return res.status(200).json({
        success: true,
        message: "OTP already sent, please check your email",
      });
    }

    // Generate OTP
    const otp = generateOtp();

    // Temporary registration data
    const registrationData = {
      name,
      country,
      phone_number,
      email: normalizedEmail,
      vehicle_type,
      registeration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
      otp,
    };

    // Store everything temporarily in Redis
    await redis.set(
      `driver:registration:${normalizedEmail}`,
      JSON.stringify(registrationData),
      {
        EX: 480, // 8 minutes
      },
    );

    // Send OTP
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Registration OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send registration OTP.",
    });
  }
}

// @desc: VERIFY OTP + CREATE DRIVER
// path: POST /api/v1/driver/auth/registration

export async function registration(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get temporary registration data
    const key = `driver:registration:${normalizedEmail}`;

    const data = await redis.get(key);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Registration expired. Please register again.",
      });
    }

    const registrationData = JSON.parse(data);

    // Verify OTP
    if (registrationData.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check again before creating
    const existingDriver = await prisma.driver.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingDriver) {
      await redis.del(key);

      return res.status(409).json({
        success: false,
        message: "Driver already registered.",
      });
    }

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        name: registrationData.name,
        country: registrationData.country,
        phone_number: registrationData.phone_number,
        email: registrationData.email,
        vehicle_type: registrationData.vehicle_type,
        registeration_number: registrationData.registeration_number,
        registeration_date: registrationData.registration_date,
        driving_license: registrationData.driving_license,
        vehicle_color: registrationData.vehicle_color,
        rate: registrationData.rate,
      },
    });

    // Delete temporary registration data
    await redis.del(key);

    // Generate JWT AFTER successful verification
    const token = jwt.sign(
      {
        driverId: driver.id,
        email: driver.email,
        role: "driver",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Driver registered successfully.",
      driver,
      token,
    });
  } catch (error) {
    console.error("Registration verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
}
