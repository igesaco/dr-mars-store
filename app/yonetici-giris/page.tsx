import Link from "next/link";
import { loginAction } from "./actions";
import { Shield, KeyRound, Mail, AlertCircle, ArrowLeft } from "lucide-react";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0c141d] via-[#101e2c] to-[#080d13] text-stone-100 selection:bg-[#c5a880] selection:text-black">
      <div className="w-full max-w-[420px] bg-[#142334]/95 border border-[#c5a880]/30 rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            <span>Mağazaya Dön</span>
          </Link>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#8f7351] text-[#0c141d] shadow-lg mb-3">
            <Shield size={24} className="stroke-[2.5]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a880]">
            DR MARS · HAUTE PARFUMERIE
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Yönetim Portalı
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Yönetici veya personel hesabınızla giriş yapın
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>Giriş bilgileri hatalı veya hesabınız aktif değil.</span>
          </div>
        )}

        {/* Login Form */}
        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5"
            >
              E-posta Adresi <span className="text-stone-500 text-[10px] lowercase">(veya boş bırakıp direkt şifre)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <Mail size={16} />
              </div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                placeholder="Örn: admin@drmars.com.tr"
                className="w-full rounded-xl border border-stone-700/80 bg-[#0c141d]/80 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-stone-500 transition-colors focus:border-[#c5a880] focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5"
            >
              Şifre *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <KeyRound size={16} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-stone-700/80 bg-[#0c141d]/80 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-stone-500 transition-colors focus:border-[#c5a880] focus:outline-none focus:ring-1 focus:ring-[#c5a880]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#dfcca8] via-[#c5a880] to-[#aa8c64] py-3.5 text-xs font-black uppercase tracking-[0.16em] text-[#0c141d] shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            Güvenli Giriş Yap
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 text-center">
          <p className="text-[10px] text-stone-500 font-medium">
            Tüm yönetim oturumları ve işlemler güvenlik gereği denetim günlüğünde (Audit Log) kayıt altına alınmaktadır.
          </p>
        </div>
      </div>
    </main>
  );
}
