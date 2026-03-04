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

export function decodeJWT(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    
    // Node.js safe base64 decoding
    const decoded = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf-8")
    );
    return decoded;
  } catch (error) {
    console.error("[decodeJWT] Error decoding token:", error);
    return null;
  }
}

export async function getCoreUser(): Promise<CoreUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("[getCoreUser] No 'token' cookie found");
    return null;
  }

  // Rely solely on the decoded JWT payload as requested
  const decoded = decodeJWT(token);
  if (!decoded) {
    console.warn("[getCoreUser] Could not decode JWT token");
    return null;
  }

  const userData = decoded.user || decoded;
  const coreId = userData.id || userData._id;
  const idNumber = userData.matricNumber || userData.staffId || userData.idNumber || userData.matricNo || userData.registrationNumber;

  return {
    ...userData,
    id: coreId,
    _id: coreId,
    idNumber: idNumber,
    role: userData.role?.toUpperCase(),
  };
}
