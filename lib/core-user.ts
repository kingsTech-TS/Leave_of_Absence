import { cookies } from "next/headers";
import { StaffCategory } from "@/types";

export interface CoreUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "STAFF" | "OFFICIAL";
  department: string;
  faculty?: string;
  matricNumber?: string;
  staffId?: string;
  idNumber?: string;
  staffCategory?: StaffCategory;
}

/**
 * Decodes a JWT payload without verifying the signature.
 * Used only for extracting role/claims after the Core API has already verified the token.
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function getCoreUser(providedToken?: string): Promise<CoreUser | null> {
  let token = providedToken;

  if (!token) {
    const cookieStore = await cookies(); // ✅ await required in Next.js 15+
    token = cookieStore.get("auth_token")?.value;
  }

  if (!token) {
    console.log("[getCoreUser] No auth_token found");
    return null;
  }

  try {
    const res = await fetch(
      `${process.env.CORE_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.warn("[getCoreUser] Core rejected token");
      return null;
    }

    const userData = await res.json();

    const coreId = userData.id || userData._id;

    const idNumber =
      userData.matricNumber ||
      userData.staffId ||
      userData.idNumber ||
      userData.matricNo ||
      userData.registrationNumber;

    return {
      ...userData,
      id: coreId,
      _id: coreId,
      idNumber,
      role: (userData.role || "STUDENT").toUpperCase(),
    };
  } catch (error) {
    console.error("[getCoreUser] Error contacting Core:", error);
    return null;
  }
}