"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppButton({
  phoneNumber = "904822121903",
  message = "Merhaba, Dr. Mars ürünleri ve koku önerileri hakkında bilgi almak istiyorum.",
}: {
  phoneNumber?: string;
  message?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 font-sans">
      {isOpen && (
        <div className="relative hidden sm:flex items-center gap-3 rounded-2xl border border-[#c5a880]/30 bg-[#0c1117]/95 p-3.5 text-white shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Kapat"
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:text-white border border-stone-600 text-xs cursor-pointer"
          >
            <X size={12} />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md">
            <MessageCircle size={22} className="fill-current" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#dfcca8]">Dr. Mars Koku Danışmanı</p>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
              Size en uygun kokuyu seçmek veya WhatsApp&apos;tan sipariş vermek için bize yazın.
            </p>
          </div>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile İletişime Geçin"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20"
      >
        <MessageCircle size={30} className="fill-current group-hover:rotate-12 transition-transform duration-300" />
      </a>
    </div>
  );
}
