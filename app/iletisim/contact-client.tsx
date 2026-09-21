"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Factory,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";

export function ContactClient({
  contact,
}: {
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    factoryAddress?: string;
    workingHours?: string;
  };
}) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Genel Bilgi");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-12">
      <div className="text-center mb-12">
        <p className="eyebrow dark justify-center">BİZE ULAŞIN</p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
          İletişim & Lokasyonlarımız
        </h1>
        <p className="mt-2 text-stone-600 text-sm max-w-lg mx-auto">
          Mardin merkezli üretim tesisimiz, tarihi 1. Cadde butik showroomumuz ve Türkiye geneli siparişleriniz için her zaman yanınızdayız.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
        {/* Contact Form */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-xs">
          <h2 className="text-xl font-black text-stone-900 mb-2">Bize Mesaj Bırakın</h2>
          <p className="text-xs text-stone-500 mb-6">
            Müşteri ilişkileri ve koku uzmanlarımız en kısa sürede tarafınıza dönüş yapacaktır.
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-black text-emerald-950 text-lg">Mesajınız Alındı!</h3>
              <p className="text-xs text-emerald-800">
                Bizimle iletişime geçtiğiniz için teşekkür ederiz. Talebiniz incelenerek en kısa sürede dönüş sağlanacaktır.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage("");
                  setName("");
                  setEmail("");
                  setPhone("");
                }}
                className="mt-4 rounded-lg bg-[#101e2c] px-5 py-2.5 text-xs font-bold text-white hover:bg-black cursor-pointer"
              >
                Yeni Mesaj Gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Telefon Numaranız
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    E-posta Adresiniz *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@alanadi.com"
                    className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Konu
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="Genel Bilgi">Genel Bilgi</option>
                    <option value="Sipariş & Kargo">Sipariş & Kargo Durumu</option>
                    <option value="Toptan & Bayilik">Toptan Satış & Bayilik Talebi</option>
                    <option value="Kurumsal Hediye">Kurumsal Hediye & Özel Üretim</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mesajınız *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı veya talebinizi detaylandırın..."
                  className="w-full rounded-lg border border-stone-300 p-3 text-sm outline-none focus:border-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#101e2c] py-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-black transition-colors cursor-pointer"
              >
                <Send size={15} /> Mesajı Gönder
              </button>
            </form>
          )}
        </div>

        {/* Store & Factory Information Cards */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
              Doğrudan İletişim Kanalları
            </h3>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <Phone className="text-[#849649] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">Telefon</strong>
                  <p>{contact.phone ?? "+90 (482) 212 19 03"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">WhatsApp Danışma Hattı</strong>
                  <p>{contact.whatsapp ?? "+90 (544) 212 19 03"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-[#849649] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">E-posta</strong>
                  <p>{contact.email ?? "info@drmarsparfum.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-[#849649] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">
                    Tarihi Butik Showroom (Mardin Merkez)
                  </strong>
                  <p>{contact.address ?? "Şar Mah. 1. Cadde No: 284, 47100 Artuklu / Mardin"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Factory className="text-[#849649] shrink-0 mt-0.5" size={18} />
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">
                    Fabrika & Ar-Ge Üretim Tesisi
                  </strong>
                  <p>{contact.factoryAddress ?? "Mardin Organize Sanayi Bölgesi 2. Cadde No: 14 Artuklu / Mardin"}</p>
                </div>
              </div>
            </div>

            {/* Official Instagram Link Card */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm">
                  <InstagramIcon size={20} />
                </div>
                <div>
                  <strong className="block text-xs font-black text-stone-900">
                    Resmi Instagram Hesabımız
                  </strong>
                  <p className="text-[11px] text-stone-600">@dr.marsparfumeri</p>
                </div>
              </div>
              <Link
                href="https://www.instagram.com/dr.marsparfumeri/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                Takip Et <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-[#0c1117] border border-[#c5a880]/30 text-white p-8 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c5a880]">
              ÇALIŞMA SAATLERİ
            </span>
            <h4 className="text-lg font-serif-luxury font-bold">
              {contact.workingHours ?? "Haftanın 7 Günü: 09:00 - 20:00"}
            </h4>
            <p className="text-xs text-stone-400">
              Online mağazamız üzerinden 7/24 kesintisiz sipariş verebilirsiniz. Siparişleriniz aynı gün veya ilk mesai gününde özenle kargolanır.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
