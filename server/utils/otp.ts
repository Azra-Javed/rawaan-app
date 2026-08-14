import redis from "../lib/redis";

//generate otp
export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// save otp
export async function saveOtp(email: string, otp: string) {
  await redis.set(`otp:${email}`, otp, {
    EX: 300,
  });
}

//get otp
export async function getOtp(email: string) {
  return await redis.get(`otp:${email}`);
}

//delete otp
export async function deleteOtp(email: string) {
  await redis.del(`otp:${email}`);
}
