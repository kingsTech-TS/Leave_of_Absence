import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.redirect(new URL("/login?error=missing_reference", request.url));
  }

  const CORE_API_URL = process.env.CORE_API_URL;
  const CORE_SYSTEM_SECRET = process.env.CORE_SYSTEM_SECRET;

  if (!CORE_API_URL || !CORE_SYSTEM_SECRET) {
    console.error("Missing CORE_API_URL or CORE_SYSTEM_SECRET environment variables.");
    return NextResponse.redirect(new URL("/login?error=system_config_error", request.url));
  }

  try {
    const response = await fetch(`${CORE_API_URL}/api/verify-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: ref,
        secret: CORE_SYSTEM_SECRET,
      }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Verification failed:", errData);
      return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
    }

    const { user, token } = await response.json();

    // Sync user with local database
    await dbConnect();
    // Use upsert to create or update the local user record
    await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          idNumber: user.idNumber,
          name: user.name,
          department: user.department || "Academic",
          faculty: user.faculty || "University",
          role: user.role,
          staffCategory: user.staffCategory || null,
          // Set a dummy password for external users if it doesn't exist
          password: user.password || "external_auth_no_password",
        },
      },
      { upsert: true, new: true }
    );

    // Set the auth cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Redirect based on role
    const rolePath = user.role.toLowerCase();
    if (user.role === "OFFICIAL") {
        return NextResponse.redirect(new URL("/official", request.url));
    }
    return NextResponse.redirect(new URL(`/${rolePath}/dashboard`, request.url));

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
