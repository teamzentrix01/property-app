import crypto from "crypto";

/* =========================================================
   DOCUMENT CONFIG
========================================================= */

export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

export const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const DOCUMENT_TYPES = new Set([
  "AADHAAR",
  "PAN",
  "ADDRESS_PROOF",
  "ID_PROOF",
  "OTHER",
]);

export const REQUIRED_DOCUMENT_TYPES = [
  "AADHAAR",
  "PAN",
  "ADDRESS_PROOF",
];

export const DOCUMENT_LABELS = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  ADDRESS_PROOF: "Address Proof",
  ID_PROOF: "ID Proof",
  OTHER: "Other Verification Document",
};

/* =========================================================
   FILE SIGNATURE CHECK
========================================================= */

function hasExpectedSignature(bytes, mimeType) {
  if (mimeType === "application/pdf") {
    return bytes.subarray(0, 4).toString() === "%PDF";
  }

  if (mimeType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(
          Buffer.from([
            137,
            80,
            78,
            71,
            13,
            10,
            26,
            10,
          ])
        )
    );
  }

  return false;
}

/* =========================================================
   VALIDATE DOCUMENT
========================================================= */

export async function validateDocument(file, documentType) {
  if (!(file instanceof File) || !file.size) {
    throw new Error("Please select a document.");
  }

  if (!DOCUMENT_TYPES.has(documentType)) {
    throw new Error("Invalid document type.");
  }

  if (!DOCUMENT_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Only PDF, JPG, JPEG and PNG files are allowed."
    );
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("File size must be 5 MB or less.");
  }

  const bytes = Buffer.from(
    await file.arrayBuffer()
  );

  if (!hasExpectedSignature(bytes, file.type)) {
    throw new Error(
      "The uploaded file does not match its file type."
    );
  }

  return bytes;
}

/* =========================================================
   CLOUDINARY CONFIG
========================================================= */

function cloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME is missing."
    );
  }

  if (!apiKey) {
    throw new Error(
      "CLOUDINARY_API_KEY is missing."
    );
  }

  if (!apiSecret) {
    throw new Error(
      "CLOUDINARY_API_SECRET is missing."
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

/* =========================================================
   UPLOAD DOCUMENT
========================================================= */

export async function uploadUserDocument(
  file,
  userId,
  documentType
) {
  /* -------------------------------------------------------
     Validate
  ------------------------------------------------------- */

  await validateDocument(
    file,
    documentType
  );

  /* -------------------------------------------------------
     Cloudinary credentials
  ------------------------------------------------------- */

  const {
    cloudName,
    apiKey,
    apiSecret,
  } = cloudinaryConfig();

  /* -------------------------------------------------------
     Cloudinary upload data
  ------------------------------------------------------- */

  const timestamp =
    Math.floor(Date.now() / 1000);

  const folder =
    `property-platform/users/${userId}/documents/${documentType.toLowerCase()}`;

  const publicId =
    `${documentType.toLowerCase()}-${crypto.randomUUID()}`;

  /* -------------------------------------------------------
     Cloudinary signature
  ------------------------------------------------------- */

  const signatureBase =
    `folder=${folder}` +
    `&public_id=${publicId}` +
    `&timestamp=${timestamp}`;

  const signature =
    crypto
      .createHash("sha1")
      .update(
        `${signatureBase}${apiSecret}`
      )
      .digest("hex");

  /* -------------------------------------------------------
     Cloudinary endpoint
  ------------------------------------------------------- */

  const cloudinaryUrl =
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  /* -------------------------------------------------------
     Request payload
  ------------------------------------------------------- */

  const payload = new FormData();

  payload.append("file", file);
  payload.append("api_key", apiKey);
  payload.append(
    "timestamp",
    String(timestamp)
  );
  payload.append("folder", folder);
  payload.append("public_id", publicId);
  payload.append("signature", signature);

  /* -------------------------------------------------------
     Upload
  ------------------------------------------------------- */

  console.log(
    "Uploading document:",
    {
      documentType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId,
    }
  );

  let response;

  try {
    response = await fetch(
      cloudinaryUrl,
      {
        method: "POST",
        body: payload,
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary network error:",
      error
    );

    throw new Error(
      `Unable to connect to Cloudinary: ${
        error?.message ||
        "Network error"
      }`
    );
  }

  /* -------------------------------------------------------
     Parse Cloudinary response
  ------------------------------------------------------- */

  const rawResponse =
    await response.text();

  let result;

  try {
    result =
      JSON.parse(rawResponse);
  } catch {
    result = {
      rawResponse,
    };
  }

  /* -------------------------------------------------------
     Cloudinary failure
  ------------------------------------------------------- */

  if (!response.ok) {
    console.error(
      "Cloudinary upload failed:",
      {
        status: response.status,
        statusText:
          response.statusText,
        result,
      }
    );

    throw new Error(
      result?.error?.message ||
        `Cloudinary upload failed with status ${response.status}`
    );
  }

  /* -------------------------------------------------------
     Validate response
  ------------------------------------------------------- */

  if (
    !result?.secure_url ||
    !result?.public_id
  ) {
    console.error(
      "Invalid Cloudinary response:",
      result
    );

    throw new Error(
      "Cloudinary did not return a valid document URL."
    );
  }

  /* -------------------------------------------------------
     Success
  ------------------------------------------------------- */

  console.log(
    "Cloudinary upload successful:",
    {
      documentType,
      publicId:
        result.public_id,
    }
  );

  return {
    cloudinaryUrl:
      result.secure_url,

    cloudinaryPublicId:
      result.public_id,

    fileType:
      file.type,

    originalName:
      file.name,
  };
}