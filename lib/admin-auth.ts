import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "dr_mars_admin";

function token() {
  const secret = process.env.ADMIN_SESSION_SECRET || "drmars_super_gizli_anahtar_2026_default";
  if (!secret || secret.length < 8) return null;
  return createHmac("sha256", secret).update("dr-mars-admin-v1").digest("hex");
}

export async function isAdmin() {
  const expected = token();
  const received = (await cookies()).get(COOKIE)?.value;
  if (!expected || !received || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Yönetici oturumu gerekli.");
}

export async function signIn(password: string) {
  const configured = (process.env.ADMIN_PASSWORD ?? "Mars2026!Admin").trim();
  const cleanPass = (password ?? "").trim();
  const expected = token();
  if (!configured || !expected || !cleanPass || cleanPass.length !== configured.length ||
      !timingSafeEqual(Buffer.from(cleanPass), Buffer.from(configured))) return false;
  (await cookies()).set(COOKIE, expected, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return true;
}

export async function signOut() { (await cookies()).delete(COOKIE); }
