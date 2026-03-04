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

export async function getCoreUser(): Promise<CoreUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const CORE_API_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  try {
    const response = await fetch(`${CORE_API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.user || data;
    const coreId = user.id || user._id;

    return {
      ...user,
      id: coreId,
      _id: coreId,
      idNumber: user.matricNumber || user.staffId || user.idNumber || user.matricNo,
    };
  } catch (error) {
    console.error("Error fetching core user:", error);
    return null;
  }
}
