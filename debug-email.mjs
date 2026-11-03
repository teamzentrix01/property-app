import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Load .env manually
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");
const envContent = readFileSync(envPath, "utf8");
envContent.split("\n").forEach((line) => {
  const clean = line.trim();
  if (!clean || clean.startsWith("#")) return;
  const eqIndex = clean.indexOf("=");
  if (eqIndex === -1) return;
  const key = clean.slice(0, eqIndex).trim();
  let val = clean.slice(eqIndex + 1).trim();
  val = val.replace(/^["']|["']$/g, "").trim();
  process.env[key] = val;
});

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

console.log("=== SMTP CONFIG ===");
console.log("HOST:", SMTP_HOST);
console.log("PORT:", SMTP_PORT);
console.log("USER:", SMTP_USER);
console.log("PASS length:", SMTP_PASS?.length, "| value:", SMTP_PASS);
console.log("FROM:", SMTP_FROM);
console.log("===================\n");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

console.log("Verifying SMTP connection...");
try {
  await transporter.verify();
  console.log("✅ SMTP connection verified!\n");

  console.log("Sending test OTP email...");
  const info = await transporter.sendMail({
    from: { name: "Bhoomi Real Estate", address: SMTP_USER },
    to: SMTP_USER,
    subject: "Test OTP - Bhoomi",
    text: "Your test OTP is: 123456. This is a test email.",
    html: "<h2>Test OTP: 123456</h2><p>SMTP is working correctly!</p>",
  });

  console.log("✅ Email sent successfully!");
  console.log("Message ID:", info.messageId);
  console.log("Response:", info.response);
} catch (err) {
  console.error("❌ ERROR:", err.message);
  console.error("Code:", err.code);
  console.error("Response:", err.response);
  console.error("ResponseCode:", err.responseCode);
  if (err.code === "EAUTH") {
    console.error("\n⚠️  Authentication failed! Possible reasons:");
    console.error("   1. App Password galat hai");
    console.error("   2. 2-Step Verification OFF hai Gmail mein");
    console.error("   3. App Password revoke ho gaya hai");
    console.error("\n   Fix: myaccount.google.com → Security → App passwords");
  }
  if (err.code === "ECONNECTION" || err.code === "EDNS") {
    console.error("\n⚠️  Network error - internet connection check karo");
  }
}

