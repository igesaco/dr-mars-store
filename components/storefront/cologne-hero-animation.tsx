"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Droplets, Gem, Sparkles, Volume2, VolumeX } from "lucide-react";
import { ReplayIntroButton } from "./intro-cinematic";

type Scent = {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  color: string;
  liquidGradient: string;
  gem: string;
  notes: string[];
  description: string;
};

const SCENTS: Scent[] = [
  {
    id: "citrus-no-01",
    name: "Citrus No. 01",
    subtitle: "Akdeniz Narenciyesi & Akik Taşı",
    slug: "citrus-no-01",
    color: "#c5a880",
    liquidGradient: "from-[#c5a880] via-[#a3855c] to-[#6e5535]",
    gem: "Hakiki Akik Taşı Kristalleri",
    notes: ["İtalyan Bergamotu", "Beyaz Çay", "Akik Taşı", "Asil Misk"],
    description: "Günün ilk ışıklarında canlandırıcı bergamot ve akik kristallerinin pozitif aurası.",
  },
  {
    id: "mineral-no-02",
    name: "Mineral No. 02",
    subtitle: "Deniz Tuzu & Pembe Kuvars",
    slug: "mineral-no-02",
    color: "#dfa3a3",
    liquidGradient: "from-[#dfa3a3] via-[#b87c7c] to-[#734646]",
    gem: "Pembe Kuvars Parçacıkları",
    notes: ["Adaçayı", "Kaya Tuzu", "Pembe Kuvars", "Sedir"],
    description: "Meltem esintisi, deniz mineralleri ve kuvarsın yatıştırıcı dinginliği.",
  },
  {
    id: "night-no-03",
    name: "Night No. 03",
    subtitle: "Sedir Ağacı & Ametist",
    slug: "night-no-03",
    color: "#a48bb5",
    liquidGradient: "from-[#a48bb5] via-[#7d6190] to-[#483357]",
    gem: "Ametist Taşı Özü",
    notes: ["Kakule", "Sedir Ağacı", "Ametist Kristali", "Koyu Amber"],
    description: "Mardin gecelerinin mistik serinliği, sedir ağacı ve asil ametist notaları.",
  },
  {
    id: "amber-no-04",
    name: "Amber No. 04",
    subtitle: "Sıcak Kehribar & Baharat",
    slug: "amber-no-04",
    color: "#d49b6a",
    liquidGradient: "from-[#d49b6a] via-[#a96f40] to-[#6e411e]",
    gem: "Altın Kehribar Özü",
    notes: ["Madagaskar Vanilyası", "Sıcak Baharatlar", "Kehribar", "Paçuli"],
    description: "Kadim Mezopotamya baharatlarının sıcacık ve unutulmaz imza dokunuşu.",
  },
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
};

export function CologneHeroAnimation() {
  const [activeScent, setActiveScent] = useState<Scent>(SCENTS[0]);
  const [isSpraying, setIsSpraying] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [releasedNotes, setReleasedNotes] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const playSpraySound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, audioCtx.currentTime);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // Audio not permitted or supported
    }
  };

  const handleSpray = () => {
    if (isSpraying) return;
    setIsSpraying(true);
    setSprayCount((c) => c + 1);
    playSpraySound();

    const canvas = canvasRef.current;
    if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      const startX = width * 0.48;
      const startY = height * 0.28;

      const newParticles: Particle[] = [];
      const particleCount = 140;

      for (let i = 0; i < particleCount; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 2.5 + Math.random() * 6.5;

        newParticles.push({
          x: startX + (Math.random() - 0.5) * 10,
          y: startY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed * 1.5,
          vy: Math.sin(angle) * speed,
          size: 1.2 + Math.random() * 3.2,
          alpha: 0.85 + Math.random() * 0.15,
          decay: 0.007 + Math.random() * 0.012,
          color: i % 4 === 0 ? "#dfcca8" : i % 3 === 0 ? "#c5a880" : "#ffffff",
        });
      }

      particlesRef.current.push(...newParticles);
    }

    const note = activeScent.notes[Math.floor(Math.random() * activeScent.notes.length)];
    const noteId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 140;

    setReleasedNotes((prev) => [
      ...prev.slice(-3),
      { id: noteId, text: note, x: randomOffset, y: -20 },
    ]);

    setTimeout(() => {
      setReleasedNotes((prev) => prev.filter((n) => n.id !== noteId));
    }, 2800);

    setTimeout(() => {
      setIsSpraying(false);
    }, 450);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy += 0.035;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeScent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpray();
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#090d12] via-[#0f151e] to-[#07090d] text-white min-h-[640px] lg:min-h-[760px] flex items-center border-b border-[#1b232e]">
      {/* Arka Plan Asil Işıltı Ambiyansı */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[160px] opacity-25 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeScent.color }}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#c5a880]/8 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-16 w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Sol Alan: Editoryal Anlatı & Koku Seçici */}
        <div className="lg:col-span-6 space-y-6 text-left z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/30 bg-[#c5a880]/10 px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#dfcca8] backdrop-blur-md">
            <Sparkles size={13} className="text-[#c5a880]" />
            <span>MARDİN KOKU MİRASI · PATENTLİ AKİK SERİSİ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-luxury tracking-tight leading-[1.05] text-white">
            Kadim mirasın, <br />
            <span
              className="italic font-normal transition-colors duration-500 gold-shimmer"
            >
              akik taşı
            </span>{" "}
            ile uyanışı.
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl font-light">
            Kimya Mühendisi Hamdullah Adsoy tarafından geliştirilen; yeryüzünün milyon yıllık şifalı akik kristalleri ve kadim Mezopotamya esanslarıyla zenginleştirilmiş <strong>%80 saf doğal ferahlık</strong>.
          </p>

          {/* Koku & Doğal Taş Seçici Kartları */}
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c5a880] mb-3 flex items-center gap-1.5">
              <Gem size={13} /> Koku & Doğal Taş Seçimi:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SCENTS.map((scent) => {
                const isSelected = scent.id === activeScent.id;
                return (
                  <button
                    key={scent.id}
                    onClick={() => {
                      setActiveScent(scent);
                      setTimeout(handleSpray, 150);
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#c5a880] bg-[#1a2330] shadow-xl shadow-[#000]/40 scale-[1.02]"
                        : "border-[#1e2735] bg-[#111722]/80 hover:border-[#c5a880]/50 hover:bg-[#161f2c]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: scent.color }}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {scent.name}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-stone-400 mt-1 line-clamp-1">
                      {scent.gem}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eylem Butonları */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={`/urun/${activeScent.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c5a880] px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#0b0f15] shadow-lg hover:bg-[#dfcca8] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              {activeScent.name} İncele <ArrowUpRight size={16} />
            </Link>

            <button
              onClick={handleSpray}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c5a880]/40 bg-[#121822] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#dfcca8] hover:bg-[#1b2433] hover:border-[#c5a880] transition-all cursor-pointer backdrop-blur"
            >
              <Droplets size={16} className={isSpraying ? "animate-spin text-[#c5a880]" : "text-[#c5a880]"} />
              Kokuyu Püskürt ({sprayCount > 0 ? `${sprayCount}x` : "Dene"})
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3.5 rounded-xl border border-[#232c3a] bg-[#121822] text-stone-400 hover:text-white hover:border-[#c5a880]/50 transition-colors"
              title={soundEnabled ? "Sesi Kapat" : "Fısfıs Sesini Aç"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-[#c5a880]" /> : <VolumeX size={16} />}
            </button>

            <ReplayIntroButton />
          </div>

          {/* Koku Piramidi Hapları */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#c5a880] font-bold text-[10.5px] uppercase tracking-wider mr-1">
              Piramit Notaları:
            </span>
            {activeScent.notes.map((note) => (
              <span
                key={note}
                className="rounded-md border border-[#263140] bg-[#111722] px-2.5 py-1 text-[11px] font-medium text-stone-300"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Sağ Alan: İnteraktif Flakon Şişe & Sis Efekti */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
          <canvas
            ref={canvasRef}
            width={500}
            height={520}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          {/* Yüzen Koku Notaları */}
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {releasedNotes.map((item) => (
              <div
                key={item.id}
                className="absolute animate-scent-float pointer-events-none"
                style={{
                  transform: `translate(${item.x}px, ${item.y}px)`,
                }}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-[#c5a880]/60 bg-[#0b0f15]/90 px-3.5 py-1 text-[11px] font-bold text-[#dfcca8] shadow-2xl backdrop-blur-md">
                  <Sparkles size={11} className="text-[#c5a880]" />
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Lüks Parfüm Şişesi (Haute Parfumerie Flacon) */}
          <div
            onClick={handleSpray}
            className="relative cursor-pointer group flex flex-col items-center select-none transition-transform duration-500 hover:scale-105 active:scale-95 z-10"
            title="Şişeye tıklayarak kokuyu püskürtün"
          >
            {/* Lüks Atomizer Başlığı (Altın Yaldızlı) */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-12 h-10 rounded-t-lg bg-gradient-to-b from-[#dfcca8] via-[#c5a880] to-[#8f7351] shadow-md border-t border-amber-100/50 flex items-center justify-center transition-all ${
                  isSpraying ? "translate-y-1.5" : ""
                }`}
              >
                {/* Püskürtme deliği */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#3d2e1b] absolute top-2 right-2 shadow-inner" />
                <div className="w-6 h-0.5 bg-[#dfcca8]/60 rounded-full" />
              </div>

              {/* Altın Boğaz Bileziği */}
              <div className="w-16 h-3 bg-gradient-to-r from-[#8f7351] via-[#dfcca8] to-[#8f7351] shadow-sm" />
            </div>

            {/* Ağır Kristal Cam Gövde */}
            <div className="relative w-56 sm:w-64 h-80 rounded-2xl border-2 border-white/20 bg-gradient-to-b from-white/10 via-white/5 to-white/10 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col justify-between p-6">
              {/* Kristal Cam Yansıması */}
              <div className="absolute top-0 left-3 w-3 h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent blur-[1px] pointer-events-none" />
              <div className="absolute top-0 right-3 w-1.5 h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

              {/* Şişe İçi Sıvı & Dalgalanma */}
              <div
                className={`absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t ${activeScent.liquidGradient} opacity-65 transition-all duration-700 ease-out`}
              >
                <div className="absolute top-0 inset-x-0 h-2 bg-white/25 blur-xs" />
              </div>

              {/* Şişe Tabanındaki Hakiki Akik / Doğal Taş Kristalleri */}
              <div className="absolute bottom-3 inset-x-4 flex justify-around items-end h-12 pointer-events-none">
                <div
                  className="w-5 h-5 rounded-md transform rotate-12 shadow-lg opacity-85 transition-all duration-700"
                  style={{ backgroundColor: activeScent.color }}
                />
                <div
                  className="w-6 h-7 rounded-lg transform -rotate-6 shadow-xl opacity-90 transition-all duration-700"
                  style={{ backgroundColor: activeScent.color }}
                />
                <div
                  className="w-4 h-4 rounded-md transform rotate-45 shadow-md opacity-75 transition-all duration-700"
                  style={{ backgroundColor: activeScent.color }}
                />
                <div
                  className="w-5 h-6 rounded-lg transform -rotate-12 shadow-lg opacity-80 transition-all duration-700"
                  style={{ backgroundColor: activeScent.color }}
                />
              </div>

              {/* Daldırma Tüpü (İnce cam boru) */}
              <div className="absolute top-0 bottom-4 left-1/2 -translate-x-1/2 w-1 bg-white/35 shadow-sm pointer-events-none" />

              {/* Ön Yüz: Lüks Metalik Etiket Plakası */}
              <div className="relative z-10 my-auto mx-auto w-44 rounded-xl border border-[#c5a880]/70 bg-[#090d12]/85 p-4 text-center shadow-2xl backdrop-blur-md">
                <div className="border-b border-[#c5a880]/30 pb-2 mb-2">
                  <span className="block text-[8px] font-bold tracking-[0.3em] text-[#dfcca8] uppercase">
                    HAUTE PARFUMERIE
                  </span>
                  <strong className="block text-lg font-black tracking-widest text-white mt-0.5">
                    DR. MARS
                  </strong>
                </div>

                <div className="py-1">
                  <span className="block text-xs font-bold tracking-wider text-[#dfcca8]">
                    {activeScent.name}
                  </span>
                  <span className="block text-[9px] text-stone-400 mt-0.5 tracking-wide uppercase">
                    {activeScent.subtitle}
                  </span>
                </div>

                <div className="border-t border-[#c5a880]/30 pt-2 mt-2 flex items-center justify-between text-[8px] text-stone-400 font-mono tracking-wider">
                  <span>MARDİN OSB</span>
                  <span className="text-[#dfcca8] font-bold">80° VOL</span>
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="relative z-10 text-center">
                <span className="text-[9px] font-bold tracking-[0.2em] text-white/70 uppercase">
                  DOĞAL AKİK TAŞI İÇERİR
                </span>
              </div>
            </div>

            {/* Şişe Altı Gölge Efekti */}
            <div className="w-48 h-5 rounded-full bg-black/70 blur-md mt-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
