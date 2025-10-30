import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  console.error("Error:", message);

  // Prevent double response
  if (res.headersSent) {
    return next(err); // Let Express's default handler deal with it
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    message = fieldErrors.join(", ");
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Nodemailer SMTP authentication errors
  if (
    err?.code === "EAUTH" ||
    err?.responseCode === 535 ||
    /535|Invalid login|authentication failed|Invalid credentials/i.test(
      err?.message || ""
    )
  ) {
    statusCode = 502;
    message =
      "Email service authentication failed (Nodemailer). Please contact support.";
  }

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, message));
};
