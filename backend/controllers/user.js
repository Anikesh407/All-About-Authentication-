import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize"
import { registerSchema } from "../config/zod.js";

export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  console.log(validation);
  console.log(validation.error.issues);

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

    return res.status(400).json({
      message: firstErrorMessage,
      error: allErrors
    })
  }
  const { name, email, password } = validation.data;
  res.json({
    name,
    email,
    password
  })
})