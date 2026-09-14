import { loginAction } from "./actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#101e2c", padding: 20 }}><form action={loginAction} style={{ width: "min(100%, 420px)", background: "white", padding: 36, borderRadius: 14 }}><p className="admin-kicker">DR MARS • YÖNETİM</p><h1 style={{ fontSize: 32, margin: "10px 0 24px" }}>Yönetici girişi</h1>{error && <p role="alert">Şifre hatalı veya yönetici ayarları eksik.</p>}<label htmlFor="password">Yönetici şifresi</label><input id="password" name="password" type="password" required autoComplete="current-password" style={{ display: "block", width: "100%", padding: 12, margin: "8px 0 18px", border: "1px solid #cad3dc", borderRadius: 6 }} /><button type="submit" style={{ width: "100%", padding: 13, background: "#caff73", border: 0, fontWeight: 800 }}>Giriş yap</button></form></main>;
}
