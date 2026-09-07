import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  hashPassword,
  signToken,
  AUTH_COOKIE,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/auth";

import {
  email,
  personName,
  phone,
} from "@/lib/validation";

import { notifyEmail } from "@/lib/mailer";

import {
  uploadUserDocument,
  validateDocument,
} from "@/lib/userDocuments";

/* =========================================================
   POST SIGNUP
========================================================= */

export async function POST(req) {
  try {
    /* =======================================================
       FORM DATA
    ======================================================= */

    const body =
      await req.formData().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          error:
            "Invalid registration form",
        },
        { status: 400 }
      );
    }

    const value = (key) =>
      String(body.get(key) || "");

    /* =======================================================
       USER INFORMATION
    ======================================================= */

    const nameValue =
      value("name");

    const emailValue =
      value("email");

    const phoneValue =
      value("phone");

    const password =
      value("password");

    const role =
      value("role");

    const name =
      personName(nameValue);

    const safeEmail =
      email(emailValue);

    const safePhone =
      phone(phoneValue);

    /* =======================================================
       VALIDATE USER
    ======================================================= */

    if (
      !name ||
      !safeEmail ||
      !safePhone ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128
    ) {
      return NextResponse.json(
        {
          error:
            "Use a valid name, email, phone, and a password of 12–128 characters",
        },
        { status: 400 }
      );
    }

    /* =======================================================
       DOCUMENTS
    ======================================================= */

    const documents = [
      [
        "aadhaarDocument",
        "AADHAAR",
      ],
      [
        "panDocument",
        "PAN",
      ],
      [
        "addressProofDocument",
        "ADDRESS_PROOF",
      ],
    ];

    const files =
      documents.map(
        ([key, documentType]) => ({
          file: body.get(key),
          documentType,
        })
      );

    /* =======================================================
       VALIDATE DOCUMENTS
    ======================================================= */

    for (
      const {
        file,
        documentType,
      } of files
    ) {
      try {
        await validateDocument(
          file,
          documentType
        );
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error?.message ||
              "Invalid document.",
          },
          { status: 400 }
        );
      }
    }

    /* =======================================================
       ROLE
    ======================================================= */

    const allowedSignupRoles = [
      "BUYER",
      "OWNER",
      "BROKER",
    ];

    const safeRole =
      allowedSignupRoles.includes(role)
        ? role
        : "BUYER";

    /* =======================================================
       EXISTING USER
    ======================================================= */

    const existing =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: safeEmail,
            },
            {
              phone: safePhone,
            },
          ],
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "An account with this email or phone already exists",
        },
        { status: 409 }
      );
    }

    /* =======================================================
       PASSWORD
    ======================================================= */

    const passwordHash =
      await hashPassword(password);

    /* =======================================================
       VERIFICATION DATES
    ======================================================= */

    const submittedAt =
      new Date();

    const verificationDeadline =
      new Date(
        submittedAt.getTime() +
          24 * 60 * 60 * 1000
      );

    /* =======================================================
       CREATE USER
    ======================================================= */

    const user =
      await prisma.user.create({
        data: {
          name,
          email: safeEmail,
          phone: safePhone,
          passwordHash,
          role: safeRole,

          verificationSubmittedAt:
            submittedAt,

          verificationDeadline:
            verificationDeadline,
        },
      });

    console.log(
      "User created:",
      user.id
    );

    /* =======================================================
       UPLOAD DOCUMENTS
    ======================================================= */

    let uploads;

    try {
      uploads =
        await Promise.all(
          files.map(
            ({
              file,
              documentType,
            }) =>
              uploadUserDocument(
                file,
                user.id,
                documentType
              )
          )
        );
    } catch (error) {
      console.error(
        "DOCUMENT UPLOAD ERROR"
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Stack:",
        error?.stack
      );

      /* -----------------------------------------------------
         Delete user if upload fails
      ----------------------------------------------------- */

      await prisma.user
        .delete({
          where: {
            id: user.id,
          },
        })
        .catch(
          (deleteError) => {
            console.error(
              "User rollback failed:",
              deleteError
            );
          }
        );

      return NextResponse.json(
        {
          error:
            "Identity document upload could not be completed",

          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        },
        { status: 502 }
      );
    }

    /* =======================================================
       SAVE DOCUMENT RECORDS
    ======================================================= */

    try {
      await prisma.userDocument.createMany(
        {
          data:
            uploads.map(
              (
                document,
                index
              ) => ({
                userId:
                  user.id,

                documentType:
                  files[index]
                    .documentType,

                originalName:
                  document.originalName,

                cloudinaryUrl:
                  document.cloudinaryUrl,

                cloudinaryPublicId:
                  document.cloudinaryPublicId,

                fileType:
                  document.fileType,
              })
            ),
        }
      );
    } catch (error) {
      console.error(
        "USER DOCUMENT DATABASE ERROR"
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Stack:",
        error?.stack
      );

      await prisma.user
        .delete({
          where: {
            id: user.id,
          },
        })
        .catch(
          (deleteError) => {
            console.error(
              "User rollback failed:",
              deleteError
            );
          }
        );

      return NextResponse.json(
        {
          error:
            "Documents uploaded but could not be saved",

          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        },
        { status: 500 }
      );
    }

    /* =======================================================
       AUTH TOKEN
    ======================================================= */

    const token =
      signToken({
        id: user.id,
        sessionVersion:
          user.sessionVersion,
      });

    /* =======================================================
       RESPONSE
    ======================================================= */

    const res =
      NextResponse.json({
        id: user.id,
        name: user.name,
        role: user.role,
      });

    res.cookies.set(
      AUTH_COOKIE,
      token,
      AUTH_COOKIE_OPTIONS
    );

    /* =======================================================
       WELCOME EMAIL
    ======================================================= */

    notifyEmail({
      to: user.email,

      subject:
        "Welcome to Bhoomi",

      heading:
        `Welcome, ${user.name}`,

      message:
        "Your Bhoomi account is ready. You can now browse properties and manage your activity from the dashboard.",

      action: {
        label:
          "Open dashboard",

        url:
          `${new URL(
            req.url
          ).origin}/dashboard`,
      },
    }).catch(
      (error) => {
        console.error(
          "Welcome email failed:",
          error
        );
      }
    );

    /* =======================================================
       SUCCESS
    ======================================================= */

    return res;
  } catch (error) {
    console.error(
      "SIGNUP API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your account.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}