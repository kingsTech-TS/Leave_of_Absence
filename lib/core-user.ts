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
    console.log("[getCoreUser] No 'token' found in cookies");
    return null;
  }

  // 1. First, try to get user data from the token itself for speed/availability
  const decoded = decodeJWT(token);
  let userData = decoded?.user || decoded;

  const CORE_API_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  // 2. Then, validate against the server and get fresh data
  try {
    const response = await fetch(`${CORE_API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const serverData = await response.json();
      userData = serverData.user || serverData;
      console.log("[getCoreUser] Fresh user data fetched successfully");
    } else {
      console.warn(`[getCoreUser] Server check non-OK: ${response.status}. Using decoded data if any.`);
      if (!userData) return null;
    }
  } catch (error) {
    console.error("[getCoreUser] Network error fetching fresh data. Using decoded data if any.");
    if (!userData) return null;
  }

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
