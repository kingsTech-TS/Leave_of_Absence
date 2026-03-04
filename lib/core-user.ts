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

    // Convert base64url → base64 for decoding
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");

    // Node.js safe base64 decoding
    const decoded = JSON.parse(
      Buffer.from(base64, "base64").toString("utf-8")
    );
    return decoded;
  } catch (error) {
    console.error("[decodeJWT] Error decoding token:", error);
    return null;
  }
}

export async function getCoreUser(providedToken?: string): Promise<CoreUser | null> {
  let token = providedToken;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }

  if (!token) {
    console.log("[getCoreUser] No 'token' found");
    return null;
  }
  
  const userDataPayload = decodeJWT(token);
  if (!userDataPayload) return null;

  const userData = userDataPayload.user || userDataPayload;
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
    idNumber: idNumber,
    role: userData.role?.toUpperCase(),
  };
}
