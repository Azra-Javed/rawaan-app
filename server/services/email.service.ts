import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: "Rawaan <onboarding@yourdomain.com>",
    to: [email],
    subject: "Your Rawaan Verification Code",
    html: `
      <div>
        <h2>Rawaan Verification Code</h2>

        <p>Your verification code is:</p>

        <h1>${otp}</h1>

        <p>This code will expire in 5 minutes.</p>

        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
