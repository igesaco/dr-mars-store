import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

const CUSTOMER_COOKIE = "dr_mars_customer_sess";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const computed = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  } catch {
    return false;
  }
}

function signUserId(userId: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "default_customer_session_secret_key_32_chars";
  const signature = createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

function verifySignedUserId(token: string): string | null {
  const [userId, signature] = token.split(".");
  if (!userId || !signature) return null;
  const secret = process.env.ADMIN_SESSION_SECRET || "default_customer_session_secret_key_32_chars";
  const expectedSignature = createHmac("sha256", secret).update(userId).digest("hex");
  if (signature !== expectedSignature) return null;
  return userId;
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const userId = verifySignedUserId(token);
  if (!userId) return null;

  try {
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

export async function customerSignIn(email: string, pass: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) return false;

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, cleanEmail), eq(users.isActive, true)))
    .limit(1);

  if (!user || !user.passwordHash) return false;
  if (!verifyPassword(cleanPass, user.passwordHash)) return false;

  // Oturum çerezi ayarla (30 gün)
  const token = signUserId(user.id);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  return true;
}

export async function customerSignUp({
  firstName,
  lastName,
  email,
  phone,
  password,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password || password.length < 6) {
    throw new Error("Geçerli bir e-posta ve en az 6 karakterli şifre giriniz.");
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, cleanEmail))
    .limit(1);

  if (existing) {
    throw new Error("Bu e-posta adresi ile kayıtlı bir hesap zaten var.");
  }

  const passwordHash = hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role: "customer",
      isActive: true,
    })
    .returning({ id: users.id });

  // Oturumu hemen başlat
  const token = signUserId(newUser.id);
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return newUser;
}

export async function customerSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}
