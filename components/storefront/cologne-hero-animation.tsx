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
    color: "#b0e03e",
    liquidGradient: "from-[#d2f348] via-[#a3d82a] to-[#7fa818]",
    gem: "Hakiki Akik Taşı Kristalleri",
    notes: ["Bergamot", "Beyaz Çay", "Akik Taşı", "Saf Misk"],
    description: "Günün ilk ışıklarında canlandırıcı bergamot ve akik kristallerinin pozitif aurası.",
  },
  {
    id: "mineral-no-02",
    name: "Mineral No. 02",
    subtitle: "Deniz Tuzu & Pembe Kuvars",
    slug: "mineral-no-02",
    color: "#4ecdc4",
    liquidGradient: "from-[#64e5db] via-[#2cb1a7] to-[#1a7f77]",
    gem: "Pembe Kuvars Parçacıkları",
    notes: ["Adaçayı", "Deniz Tuzu", "Pembe Kuvars", "Sedir"],
    description: "Meltem esintisi, deniz mineralleri ve kuvarsın yatıştırıcı dinginliği.",
  },
  {
    id: "night-no-03",
    name: "Night No. 03",
    subtitle: "Sedir Ağacı & Ametist",
    slug: "night-no-03",
    color: "#9d4edd",
    liquidGradient: "from-[#b565ff] via-[#7924c7] to-[#470a7d]",
    gem: "Ametist Taşı Özü",
    notes: ["Kakule", "Sedir Ağacı", "Ametist", "Koyu Amber"],
    description: "Mardin gecelerinin mistik serinliği, sedir ağacı ve asil ametist notaları.",
  },
  {
    id: "amber-no-04",
    name: "Amber No. 04",
    subtitle: "Sıcak Kehribar & Baharat",
    slug: "amber-no-04",
    color: "#f4a261",
    liquidGradient: "from-[#f9b26e] via-[#e76f51] to-[#b33e24]",
    gem: "Altın Kehribar Özü",
    notes: ["Vanilya", "Sıcak Baharatlar", "Kehribar", "Paçuli"],
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

  // Play subtle web audio puff sound if enabled
  const playSpraySound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Pink noise-like short whoosh
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.35);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch {
      // sessizce geç
    }
  };

  // Spray action
  const handleSpray = () => {
    setIsSpraying(true);
    setSprayCount((c) => c + 1);
    playSpraySound();

    // Spawn 120-150 aerosol mist particles from nozzle
    if (canvasRef.current) {
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const startX = width * 0.5;
      const startY = height * 0.22;

      const newParticles: Particle[] = [];
      const particleCount = 140;

      for (let i = 0; i < particleCount; i++) {
        // Spray angle cone (-120deg to -60deg up & sideways)
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const speed = Math.random() * 8 + 3;
        newParticles.push({
          x: startX + (Math.random() - 0.5) * 14,
          y: startY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed * (Math.random() > 0.4 ? 1.2 : -1.2),
          vy: Math.sin(angle) * speed - Math.random() * 3,
          size: Math.random() * 4.5 + 1.2,
          alpha: Math.random() * 0.7 + 0.3,
          decay: Math.random() * 0.015 + 0.012,
          color: Math.random() > 0.3 ? activeScent.color : "#ffffff",
        });
      }
      particlesRef.current.push(...newParticles);
    }

    // Spawn floating fragrance note bubbles
    const note = activeScent.notes[Math.floor(Math.random() * activeScent.notes.length)];
    const newNote = {
      id: Date.now() + Math.random(),
      text: note,
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 60,
    };
    setReleasedNotes((prev) => [...prev.slice(-4), newNote]);

    setTimeout(() => {
      setIsSpraying(false);
    }, 450);
  };

  // Canvas particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // air resistance
        p.vy *= 0.96;
        p.vy -= 0.04; // buoyant vapor rising
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 12;
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

  // Gentle initial spray on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpray();
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1620] via-[#101e2c] to-[#080d14] text-white min-h-[640px] lg:min-h-[760px] flex items-center">
      {/* Background Ambience Glow */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-30 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeScent.color }}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#caff73]/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-12 lg:px-16 w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Side: Brand Narrative & Scent Picker */}
        <div className="lg:col-span-6 space-y-6 text-left z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#caff73] backdrop-blur">
            <Sparkles size={14} className="animate-pulse" />
            <span>MARDİN KOKU MİRASI · DOĞAL TAŞ SERİSİ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02]">
            Kokunun <br />
            <span
              className="font-serif italic font-normal transition-colors duration-500"
              style={{ color: activeScent.color }}
            >
              en asil
            </span>{" "}
            hali.
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            Kimya Mühendisi Hamdullah Adsoy tarafından geliştirilen, yeryüzünün şifalı akik kristalleri ve Mezopotamya esanslarıyla zenginleştirilmiş <strong>%80 doğal ferahlık</strong>.
          </p>

          {/* Scent Tabs */}
          <div className="pt-2">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5">
              <Gem size={13} className="text-[#caff73]" /> Koku & Doğal Taş Seçimi:
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
                        ? "border-white bg-white/15 shadow-lg scale-102"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: scent.color }}
                      />
                      <span className="text-xs font-black text-white truncate">
                        {scent.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                      {scent.gem}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Call to Actions & Scent Note Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={`/urun/${activeScent.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-xs font-black uppercase tracking-wider text-stone-950 shadow-lg hover:bg-[#caff73] transition-all transform hover:-translate-y-0.5"
            >
              {activeScent.name} İncele <ArrowUpRight size={16} />
            </Link>

            <button
              onClick={handleSpray}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur"
            >
              <Droplets size={16} className={isSpraying ? "animate-spin text-[#caff73]" : "text-[#caff73]"} />
              Kokuyu Püskürt ({sprayCount > 0 ? `${sprayCount}x` : "Dene"})
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3.5 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
              title={soundEnabled ? "Sesi Kapat" : "Fısfıs Sesini Aç"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-[#caff73]" /> : <VolumeX size={16} />}
            </button>

            <ReplayIntroButton />
          </div>

          {/* Scent notes pill list */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-400 font-bold text-[11px] uppercase mr-1">
              Koku Notaları:
            </span>
            {activeScent.notes.map((note) => (
              <span
                key={note}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-stone-300"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive Cologne Bottle Art & Aerosol Mist Animation */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
          {/* Canvas for dynamic micro-droplet mist */}
          <canvas
            ref={canvasRef}
            width={500}
            height={520}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          {/* Floating Scent Notes popping into the air */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {releasedNotes.map((item) => (
              <div
                key={item.id}
                className="absolute left-1/2 top-[24%] transform -translate-x-1/2 -translate-y-1/2 animate-scent-float inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-xl backdrop-blur"
                style={{
                  transform: `translate(${item.x}px, ${item.y - 40}px)`,
                }}
              >
                <Sparkles size={12} className="text-[#caff73]" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Cologne Bottle 3D Presentation Container */}
          <div
            onClick={handleSpray}
            className={`relative group cursor-pointer select-none transition-transform duration-300 ${
              isSpraying ? "scale-95 translate-y-1" : "hover:scale-105"
            }`}
            title="Şişeye tıklayarak kokuyu püskürtün!"
          >
            {/* Atmospheric Pedestal Glow */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full blur-xl opacity-60 transition-all duration-700"
              style={{ backgroundColor: activeScent.color }}
            />

            {/* Cologne Bottle Structure */}
            <div className="relative w-48 sm:w-56 h-[380px] sm:h-[440px] mx-auto flex flex-col items-center">
              {/* Atomizer Cap / Golden Sprayer */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Sprayer Pump Nozzle */}
                <div
                  className={`w-9 h-7 rounded-t-md bg-gradient-to-r from-[#d4af37] via-[#fff3a8] to-[#aa8012] shadow-md border-b border-[#775705] transition-transform duration-150 ${
                    isSpraying ? "translate-y-2" : "group-hover:-translate-y-0.5"
                  }`}
                >
                  {/* Spray Hole */}
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-900 mx-auto mt-2" />
                </div>
                {/* Sprayer Neck Ring */}
                <div className="w-14 h-5 rounded-md bg-gradient-to-r from-[#b38f2a] via-[#f7e089] to-[#8c6b14] shadow-sm" />
                {/* Bottle Neck Glass */}
                <div className="w-16 h-6 bg-white/20 backdrop-blur-md border-x border-white/40" />
              </div>

              {/* Main Heavy Flacon Glass Body */}
              <div className="relative w-full flex-1 rounded-3xl border-2 border-white/40 bg-gradient-to-b from-white/15 via-white/5 to-white/20 backdrop-blur-xl shadow-2xl overflow-hidden p-3 flex flex-col justify-between">
                {/* Glass Light Reflection Beam */}
                <div className="absolute -inset-full w-[250%] h-[250%] bg-gradient-to-tr from-transparent via-white/25 to-transparent rotate-25 pointer-events-none transform translate-x-[-40%] group-hover:translate-x-[40%] transition-transform duration-1000" />

                {/* Inner Suction Dip Tube */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-6 w-1 bg-white/40 rounded-full z-0" />

                {/* Liquid Inside Bottle with Wave Fluid Animation */}
                <div
                  className={`absolute left-2 right-2 bottom-2 top-24 rounded-2xl bg-gradient-to-b ${activeScent.liquidGradient} opacity-80 transition-all duration-700 overflow-hidden`}
                >
                  {/* Fluid Surface Wave */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/30 rounded-full blur-[1px] animate-pulse" />

                  {/* Gemstone Crystal Facets Floating Inside (Dr. Mars signature) */}
                  <div className="absolute bottom-4 left-6 w-5 h-5 rounded-sm bg-white/50 rotate-45 backdrop-blur-sm border border-white/80 shadow-md animate-bounce" />
                  <div className="absolute bottom-8 right-8 w-4 h-4 rounded-sm bg-white/40 -rotate-12 backdrop-blur-sm border border-white/70 shadow-sm" />
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-sm bg-white/60 rotate-12 backdrop-blur-sm border border-white/90" />
                </div>

                {/* Bottle Label Plate (Luxury Minimalist) */}
                <div className="relative z-10 mx-auto my-auto w-36 sm:w-40 rounded-xl bg-[#0b141d]/90 border border-white/20 p-3.5 text-center shadow-xl backdrop-blur-md">
                  <span className="block text-[9px] font-black tracking-widest text-[#caff73] uppercase">
                    DR MARS · MARDİN
                  </span>
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5">
                    {activeScent.name}
                  </h3>
                  <div className="w-8 h-[1px] bg-white/30 mx-auto my-1.5" />
                  <p className="text-[9px] font-bold tracking-widest text-stone-300 uppercase">
                    MODERN COLOGNE
                  </p>
                  <p className="text-[8px] font-mono text-[#caff73] mt-1">
                    %80 VOL · 250 ML
                  </p>
                </div>

                {/* Bottom Weight & Volume Stamp */}
                <div className="relative z-10 flex justify-between items-center px-3 text-[9px] font-mono text-white/60">
                  <span>ATELIER</span>
                  <span>EAU DE COLOGNE</span>
                </div>
              </div>
            </div>

            {/* Click to Spray Hint Badge */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold text-white/90 backdrop-blur group-hover:bg-[#caff73] group-hover:text-[#101e2c] transition-all">
                <Droplets size={12} />
                Şişeye Dokun ve Ferahlığı Hisset
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
