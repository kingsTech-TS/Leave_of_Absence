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
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("[decodeJWT] Invalid token format (expected 3 parts)");
      return null;
    }
    
    const payloadBase64 = parts[1];
    // Convert base64url → base64 and add padding
    let base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const decodedString = Buffer.from(base64, "base64").toString("utf-8");
    try {
      return JSON.parse(decodedString);
    } catch (parseError) {
      console.error("[decodeJWT] JSON.parse failed. Raw payload:", decodedString);
      return null;
    }
  } catch (error) {
    console.error("[decodeJWT] Critical error during decoding:", error);
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
    console.log("[getCoreUser] No 'token' cookie found");
    return null;
  }
  
  const userDataPayload = decodeJWT(token);
  if (!userDataPayload) {
    console.error("[getCoreUser] Token found but decoding failed");
    return null;
  }

  const userData = userDataPayload.user || userDataPayload;
  const coreId = userData.id || userData._id;
  const idNumber =
    userData.matricNumber ||
    userData.staffId ||
    userData.idNumber ||
    userData.matricNo ||
    userData.registrationNumber ||
    userData.registrationNo;

  return {
    ...userData,
    id: coreId,
    _id: coreId,
    idNumber: idNumber,
    role: (userData.role || "STUDENT").toUpperCase(),
  };
}
