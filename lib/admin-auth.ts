import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

const COOKIE = "dr_mars_admin";

export type AdminUserSession = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "editor";
  isSuperAdmin: boolean;
};

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || "dr_mars_secret_key_prod_987654321_secure_session_token_xyz";
}

function legacyToken(): string {
  return createHmac("sha256", getSecretKey()).update("dr-mars-admin-v1").digest("hex");
}

function signSession(session: AdminUserSession): string {
  const secret = getSecretKey();
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifySession(token: string): AdminUserSession | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const secret = getSecretKey();
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.id || !data.email) return null;
    return data as AdminUserSession;
  } catch {
    return null;
  }
}

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyAdminPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const computed = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  } catch {
    return false;
  }
}

export async function getCurrentAdmin(): Promise<AdminUserSession | null> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(COOKIE)?.value;
  if (!cookieVal) return null;

  // 1. Eski legacy token kontrolü (Master şifre ile girilmişse)
  const legacy = legacyToken();
  if (cookieVal === legacy) {
    return {
      id: "root-master",
      email: "admin@drmars.com.tr",
      name: "Admin",
      role: "admin",
      isSuperAdmin: true,
    };
  }

  // 2. İmzalı oturum kontrolü
  return verifySession(cookieVal);
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentAdmin()) !== null;
}

export async function requireAdmin(): Promise<AdminUserSession> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Yönetici oturumu gerekli.");
  }
  return admin;
}

export async function requireSuperAdmin(): Promise<AdminUserSession> {
  const admin = await requireAdmin();
  if (!admin.isSuperAdmin) {
    throw new Error("Bu işlem için yalnızca Admin yetkilidir.");
  }
  return admin;
}

export async function signIn(identifierOrPassword: string, optionalPassword?: string): Promise<boolean> {
  const configuredMasterPass = (process.env.ADMIN_PASSWORD ?? "Mars2026!Admin").trim();
  const raw1 = (identifierOrPassword ?? "").trim();
  const raw2 = (optionalPassword ?? "").trim();

  const cookieStore = await cookies();

  // Durum 1: Tek şifre ile giriş yapılmış veya şifre kutusuna Master Şifre yazılmış
  const isMasterPass = (raw1 === configuredMasterPass && !raw2) || raw2 === configuredMasterPass;

  if (isMasterPass) {
    const rootSession: AdminUserSession = {
      id: "root-master",
      email: "admin@drmars.com.tr",
      name: "Admin",
      role: "admin",
      isSuperAdmin: true,
    };
    const signed = signSession(rootSession);
    cookieStore.set(COOKIE, signed, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });
    return true;
  }

  // Durum 2: Kullanıcı e-posta ve şifre ile giriş denemesi
  const emailInput = raw2 ? raw1.toLowerCase() : "";
  const passwordInput = raw2 ? raw2 : raw1;

  if (!emailInput || !passwordInput) return false;

  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, emailInput),
          inArray(users.role, ["admin", "manager", "editor"]),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (!user || !user.passwordHash) return false;
    if (!verifyAdminPassword(passwordInput, user.passwordHash)) return false;

    // Giriş başarılı, oturum oluştur
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const session: AdminUserSession = {
      id: user.id,
      email: user.email,
      name: fullName || user.email,
      role: user.role as "admin" | "manager" | "editor",
      isSuperAdmin: Boolean(user.isSuperAdmin),
    };

    const signed = signSession(session);
    cookieStore.set(COOKIE, signed, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Son giriş tarihini güncelle
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    return true;
  } catch (err) {
    console.error("Giriş kontrolünde hata:", err);
    return false;
  }
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
