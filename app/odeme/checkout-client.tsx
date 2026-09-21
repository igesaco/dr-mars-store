"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, Copy, CreditCard, DollarSign, HelpCircle, Lock, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { createOrderAction } from "./actions";

export function CheckoutClient({ paymentSettings }: { paymentSettings?: any }) {
  const router = useRouter();
  const { items, subtotal, shippingCost, discountAmount, total, coupon, clearCart } = useCart();

  const isTestMode = paymentSettings?.mode !== "live";
  const bankAccounts = paymentSettings?.bankAccounts ?? [
    {
      bankName: "Akbank T.A.Ş.",
      accountHolder: "Dr. Mars Parfüm Kozmetik Ltd. Şti.",
      iban: "TR56 0004 6000 0001 2345 6789 01",
      branch: "Mardin Şubesi",
    },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "İstanbul",
    district: "Şişli",
    addressLine: "",
    postalCode: "34365",
    paymentMethod: "credit_card" as "credit_card" | "bank_transfer" | "cash_on_delivery",
    customerNote: "",
    acceptTerms: true,
  });

  // Credit Card form state
  const [cardData, setCardData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const copyIban = (iban: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(iban.replace(/\s+/g, ""));
      setCopiedIban(iban);
      setTimeout(() => setCopiedIban(null), 2500);
    }
  };

  const fillTestCard = () => {
    setCardData({
      cardHolder: "AHMET YILMAZ",
      cardNumber: "5400 0000 0000 0000",
      expiry: "12/28",
      cvv: "123",
    });
  };

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(" ") : raw;
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-200 text-stone-500">
          <ShoppingBag size={38} />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-stone-900">Sepetiniz Boş</h1>
        <p className="mt-2 text-sm text-stone-500">
          Ödeme adımına geçebilmek için sepetinizde en az bir ürün bulunmalıdır.
        </p>
        <Link
          href="/kategori/kolonyalar"
          className="mt-6 inline-block rounded-xl bg-[#0e131a] border border-[#c5a880]/30 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#0e131a] transition-all"
        >
          Alışverişe Başla
        </Link>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Lütfen ön bilgilendirme koşullarını ve satış sözleşmesini onaylayınız.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createOrderAction({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        addressLine: formData.addressLine,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
        customerNote: formData.customerNote,
        couponCode: coupon?.code,
        cardData: formData.paymentMethod === "credit_card" ? {
          cardHolder: cardData.cardHolder,
          cardNumber: cardData.cardNumber,
          expiry: cardData.expiry,
          cvv: cardData.cvv,
        } : undefined,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });

      if (!res.success || !res.orderNumber) {
        setError(res.message ?? "Sipariş işlenirken bir hata oluştu.");
        setLoading(false);
        return;
      }

      // Sepeti temizle ve başarı sayfasına yönlendir
      clearCart();
      router.push(`/siparis-tamamlandi/${res.orderNumber}`);
    } catch {
      setError("Beklenmedik bir bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/sepet"
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Sepete Dön
        </Link>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-800">
          <Lock size={13} /> 256-Bit SSL Güvenli Checkout
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_420px] gap-10">
        {/* Left Form: Customer & Delivery Details */}
        <div className="space-y-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          {/* 1. İletişim Bilgileri */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black tracking-tight text-stone-900 mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#101e2c] text-xs font-bold text-white">
                1
              </span>
              İletişim Bilgileri
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ad *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ahmet"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Yılmaz"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmet@example.com"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0532 123 45 67"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Teslimat Adresi */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black tracking-tight text-stone-900 mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#101e2c] text-xs font-bold text-white">
                2
              </span>
              Teslimat Adresi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">İl *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900 bg-white"
                >
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                  <option value="Antalya">Antalya</option>
                  <option value="Eskişehir">Eskişehir</option>
                  <option value="Diğer">Diğer İl</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">İlçe *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Kadıköy, Şişli vb."
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Açık Adres *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Mahalle, cadde, sokak, bina ve daire numarası"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Posta Kodu</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="34000"
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sipariş Notu (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.customerNote}
                  onChange={(e) => setFormData({ ...formData, customerNote: e.target.value })}
                  placeholder="Zili çalmayınız, kargoya not vb."
                  className="w-full rounded-lg border border-stone-300 p-3 text-base sm:text-sm outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Ödeme Yöntemi */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black tracking-tight text-stone-900 mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#101e2c] text-xs font-bold text-white">
                3
              </span>
              Ödeme Yöntemi
            </h2>

            {/* Method Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { id: "credit_card", label: "Kredi / Banka Kartı", icon: CreditCard },
                { id: "bank_transfer", label: "Havale / EFT", icon: DollarSign },
                { id: "cash_on_delivery", label: "Kapıda Ödeme", icon: Truck },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: id as any })}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-bold transition-all ${
                    formData.paymentMethod === id
                      ? "border-[#101e2c] bg-[#101e2c] text-white shadow-xs"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Credit Card Details Form */}
            {formData.paymentMethod === "credit_card" && (
              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:p-6 space-y-4">
                {isTestMode && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>
                        <strong>Sanal POS Test Modu:</strong> Gerçek kartınızdan para çekilmez.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-950 transition-colors cursor-pointer"
                    >
                      <Sparkles size={13} /> Test Kartı Doldur
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} className="text-emerald-700" />
                    256-Bit SSL Uçtan Uca Şifreli Ödeme
                  </span>
                  <span className="font-bold text-stone-700">Tüm Banka Kartları Geçerlidir</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    value={cardData.cardHolder}
                    onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                    placeholder="AHMET YILMAZ"
                    className="w-full rounded-lg border border-stone-300 bg-white p-3 text-base sm:text-sm uppercase outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kart Numarası</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                    placeholder="5400 0000 0000 0000"
                    className="w-full rounded-lg border border-stone-300 bg-white p-3 text-base sm:text-sm font-mono outline-none focus:border-stone-900 tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Son Kullanma (AA/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                      placeholder="12/28"
                      className="w-full rounded-lg border border-stone-300 bg-white p-3 text-base sm:text-sm font-mono outline-none focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">CVC / Güvenlik Kodu</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      className="w-full rounded-lg border border-stone-300 bg-white p-3 text-base sm:text-sm font-mono outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {formData.paymentMethod === "bank_transfer" && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-6 text-xs text-stone-700 space-y-4">
                <div>
                  <p className="font-bold text-stone-900 text-sm">Resmi Banka Hesap Bilgilerimiz:</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Aşağıdaki hesaplarımızdan herhangi birine sipariş tutarını gönderebilirsiniz.
                  </p>
                </div>

                <div className="space-y-3">
                  {bankAccounts.map((acc: any, idx: number) => (
                    <div key={idx} className="rounded-xl bg-white p-4 border border-stone-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-stone-900 text-xs uppercase">{acc.bankName}</span>
                        {acc.branch && <span className="text-[11px] text-stone-500">{acc.branch}</span>}
                      </div>
                      <p className="text-[11px] text-stone-600">
                        <strong>Alıcı:</strong> {acc.accountHolder}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100">
                        <span className="font-mono text-xs font-bold text-stone-900 select-all">
                          {acc.iban}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyIban(acc.iban)}
                          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {copiedIban === acc.iban ? (
                            <>
                              <Check size={13} className="text-emerald-700" />
                              <span className="text-emerald-800">Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>IBAN Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-amber-50/80 border border-amber-200/70 p-3 text-amber-900 text-[11px] leading-relaxed">
                  ⚠️ <strong>Önemli:</strong> Havale/EFT işlemi yaparken açıklama kısmına sipariş tamamlandıktan sonra verilecek olan <strong>Sipariş Numaranızı</strong> yazınız.
                </div>
              </div>
            )}

            {/* Cash on Delivery Details */}
            {formData.paymentMethod === "cash_on_delivery" && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-6 text-xs text-stone-700 space-y-2">
                <p className="font-bold text-stone-900 text-sm">Kapıda Nakit veya Kredi Kartı ile Ödeme</p>
                <p className="text-stone-600 leading-relaxed">
                  Siparişiniz kargo görevlisi tarafından adresinize teslim edildiğinde kapıda nakit veya mobil POS cihazı üzerinden kredi kartınızla ödeme yapabilirsiniz.
                </p>
              </div>
            )}

            {/* Terms checkbox */}
            <div className="mt-6 flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[#101e2c] focus:ring-0"
              />
              <label htmlFor="terms" className="text-xs text-stone-600">
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-bold underline text-stone-900">
                  Ön Bilgilendirme Koşulları
                </Link>
                &apos;nı ve{" "}
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-bold underline text-stone-900">
                  Mesafeli Satış Sözleşmesi
                </Link>
                &apos;ni okudum, onaylıyorum.
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold tracking-tight text-stone-900 border-b border-stone-100 pb-3">
              Sipariş Özeti ({items.reduce((s, i) => s + i.quantity, 0)} Ürün)
            </h2>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between items-center py-2.5 text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <p className="text-stone-500">
                      {item.variantName} × {item.quantity} adet
                    </p>
                  </div>
                  <span className="font-extrabold text-stone-900">
                    ₺{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>₺{subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>İndirim ({coupon?.code})</span>
                  <span>-₺{discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kargo Bedeli</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700">Ücretsiz</strong>
                  ) : (
                    `₺${shippingCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-black text-stone-900">
                <span>Ödenecek Tutar</span>
                <span>₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Complete Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c5a880] py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#0a0e14] shadow-xl hover:bg-[#dfcca8] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>İşleniyor...</span>
              ) : (
                <>
                  <ShieldCheck size={18} /> Siparişi Onayla ve Bitir
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-stone-500 space-y-1">
              <p>🔒 Tüm işlemler 256-Bit SSL ile şifrelenmektedir.</p>
              <p>Müşteri Hizmetleri & WhatsApp: +90 482 212 19 03</p>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
