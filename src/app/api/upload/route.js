import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/serverAuth";

const MAX_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 12;
const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const CLOUDINARY_FOLDER = "bhoomi/properties";

function isImage(bytes, type) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (type === "image/avif") return bytes.subarray(4, 8).toString() === "ftyp" && bytes.subarray(8, 12).toString().includes("avif");
  return false;
}

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured");
  return { cloudName, apiKey, apiSecret };
}

export async function POST(req) {
  const auth = await requireUser(["OWNER", "BROKER"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid upload form" }, { status: 400 });
  const files = formData.getAll("files").filter((file) => file instanceof File);
  if (!files.length || files.length > MAX_FILES) return NextResponse.json({ error: `Upload 1–${MAX_FILES} images at a time` }, { status: 400 });
  if (files.some((file) => !ALLOWED[file.type] || !file.size || file.size > MAX_SIZE)) return NextResponse.json({ error: "Each image must be JPEG, PNG, WebP, or AVIF and no larger than 8MB" }, { status: 400 });

  const prepared = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isImage(bytes, file.type)) return NextResponse.json({ error: "An uploaded file did not match its declared image type" }, { status: 400 });
    prepared.push(new File([bytes], `${crypto.randomUUID()}.${ALLOWED[file.type]}`, { type: file.type }));
  }

  try {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash("sha1").update(`folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`).digest("hex");
    const urls = [];
    for (const file of prepared) {
      const payload = new FormData();
      payload.set("file", file);
      payload.set("api_key", apiKey);
      payload.set("timestamp", String(timestamp));
      payload.set("folder", CLOUDINARY_FOLDER);
      payload.set("signature", signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: payload });
      const result = await response.json();
      if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Cloudinary upload failed");
      urls.push(result.secure_url);
    }
    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return NextResponse.json({ error: "Image upload could not be completed" }, { status: 502 });
  }
}
