import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize"
import { registerSchema } from "../config/zod.js";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import sendMail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../config/html.js";
import User from "../models/User.js"
import { redisClient } from "../index.js";


export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  console.log(validation);


  if (!validation.success) {
    const zodError = validation.error;
    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }
    console.log(firstErrorMessage);
    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors
    })
  }
  const { name, email, password } = validation.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  const isRateLimited = await redisClient.get(rateLimitKey);

  if (isRateLimited) {
    return res.status(429).json({
      message: "Too many requests. Please try again after 1 minute."
    });
  }

  const existUser = await User.findOne({ email });
  if (existUser) {
    return res.status(400).json({
      message: "User already exists"
    })
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString("hex");

  const verifyKey = `verify:${verifyToken}`

  const datatoStore = JSON.stringify({
    name,
    email,
    password: hashPassword
  })

  await redisClient.set(verifyKey, datatoStore, { EX: 300 });

  const subject = "Verify Your Email For Account Creation";
  const html = getVerifyEmailHtml({ email, verifyToken });
  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  res.json({
    message: "If your email is valid ,a verification link has been sent.it is only valid for 5 minutes"
  })
})