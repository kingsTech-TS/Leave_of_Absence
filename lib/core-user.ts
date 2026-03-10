import { cookies } from "next/headers";
import { StaffCategory } from "@/types";
import { verifyToken } from "@/lib/auth";

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
  officialLevel?: string;
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

  // 1️⃣ Try Core API first (for tokens issued by the Core Platform)
  try {
    const res = await fetch(
      `${process.env.CORE_API_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // Don't hang forever
      }
    );

    if (res.ok) {
      const userData = await res.json();
      const coreId = userData.id || userData._id;
      const idNumber =
        userData.matricNumber ||
        userData.staffId ||
        userData.idNumber ||
        userData.matricNo ||
        userData.registrationNumber;

      const department = userData.department || userData.dept || userData.deptName;
      const faculty = userData.faculty || userData.fac || userData.facultyName;

      return {
        ...userData,
        id: coreId,
        _id: coreId,
        idNumber,
        department,
        faculty,
        role: (userData.role || "STUDENT").toUpperCase(),
      };
    }
  } catch {
    // Core is unreachable or timed out — fall through to local JWT
  }

  // 2️⃣ Fallback: decode local JWT (tokens issued by loginUser server action)
  console.log("[getCoreUser] Core unavailable — decoding local JWT");
  try {
    const decoded = await verifyToken(token) as Record<string, any> | null;
    if (!decoded) return null;

    return {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: (decoded.role || "STUDENT").toUpperCase() as CoreUser["role"],
      department: decoded.department,
      faculty: decoded.faculty,
      idNumber: decoded.idNumber,
      officialLevel: decoded.officialLevel ?? null,
      staffCategory: decoded.staffCategory ?? null,
    };
  } catch (error) {
    console.error("[getCoreUser] Error decoding local JWT:", error);
    return null;
  }
}