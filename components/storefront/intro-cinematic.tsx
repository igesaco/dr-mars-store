"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Atom, Check, FlaskConical, Gem, Sparkles, Volume2, VolumeX, X } from "lucide-react";

type IntroCinematicProps = {
  onComplete?: () => void;
  autoPlayOnce?: boolean;
};

export function IntroCinematic({ onComplete, autoPlayOnce = true }: IntroCinematicProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoPlayOnce) {
        setIsOpen(true);
        return;
      }
      const seen = sessionStorage.getItem("dr_mars_cinematic_seen");
      if (!seen) {
        setIsOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [autoPlayOnce]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("dr_mars_cinematic_seen", "true");
    } catch {
      // quota/private browsing
    }
    if (onComplete) onComplete();
  }, [onComplete]);

  const playSwellSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const freqs = [196, 246.94, 293.66, 392];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.6);
      });
    } catch {
      // Audio not permitted
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    if (!isOpen) return;

    const totalDuration = 7000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);

      if (elapsed < 2000) {
        setPhase(0);
      } else if (elapsed < 4200) {
        setPhase(1);
      } else if (elapsed < 6000) {
        setPhase(2);
      } else {
        setPhase(3);
      }

      if (elapsed >= totalDuration + 2000) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    type AtomNode = {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      orbitRadius: number;
      orbitSpeed: number;
      angle: number;
      size: number;
      color: string;
      label?: string;
    };

    const atoms: AtomNode[] = [];
    const count = 48;
    const labels = ["C₁₀H₁₆", "C₂H₅OH", "SiO₂", "AKİK", "%80 ALKOL", "MARDİN", "KUVARS", "SEDİR"];

    for (let i = 0; i < count; i++) {
      const isSpecial = i < labels.length;
      atoms.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        orbitRadius: 40 + Math.random() * 260,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
        angle: Math.random() * Math.PI * 2,
        size: isSpecial ? 4.5 : 2 + Math.random() * 2.5,
        color: isSpecial
          ? "#dfcca8"
          : i % 2 === 0
          ? "#c5a880"
          : "#ffffff",
        label: isSpecial ? labels[i] : undefined,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      atoms.forEach((atom, i) => {
        atom.angle += atom.orbitSpeed;

        if (phase === 0) {
          const currentRadius = atom.orbitRadius + Math.sin(time + i) * 15;
          atom.x = centerX + Math.cos(atom.angle) * currentRadius;
          atom.y = centerY + Math.sin(atom.angle) * currentRadius * 0.7;
        } else if (phase === 1) {
          const hexRadius = atom.orbitRadius * 0.85;
          const snapAngle = Math.round(atom.angle / (Math.PI / 3)) * (Math.PI / 3);
          atom.x = centerX + Math.cos(snapAngle + time * 0.3) * hexRadius;
          atom.y = centerY + Math.sin(snapAngle + time * 0.3) * hexRadius;
        } else if (phase === 2) {
          const vortexRadius = Math.max(12, atom.orbitRadius * (1 - (progress - 60) / 40));
          atom.angle += 0.06;
          atom.x = centerX + Math.cos(atom.angle) * vortexRadius;
          atom.y = centerY + Math.sin(atom.angle) * vortexRadius;
        } else {
          atom.x += (Math.random() - 0.5) * 2;
          atom.y -= 0.6;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, atom.size, 0, Math.PI * 2);
        ctx.fillStyle = atom.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = atom.color;
        ctx.fill();

        if (atom.label && (phase === 0 || phase === 1)) {
          ctx.fillStyle = "rgba(223, 204, 168, 0.85)";
          ctx.font = "bold 9px monospace";
          ctx.fillText(atom.label, atom.x + 8, atom.y + 3);
        }
        ctx.restore();
      });

      // Merkez ışık aurası
      ctx.save();
      const pulseSize = phase === 2 ? 45 + Math.sin(time * 8) * 12 : 20 + Math.sin(time * 3) * 4;
      const grad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulseSize * 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, "#c5a880");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, phase, progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#070a0e] text-white select-none overflow-hidden animate-in fade-in duration-500">
      {/* Tuval Arka Plan Parçacık Evreni */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Üst Bar & Kontroller */}
      <div className="relative z-20 flex items-center justify-between p-6 sm:px-12 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111722] border border-[#c5a880]/30 text-[#c5a880]">
            <Atom size={18} className="animate-spin" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.25em] text-[#dfcca8]">
              DR. MARS · ATELIER
            </span>
            <span className="text-[10px] text-stone-400 font-mono tracking-wider">
              Haute Parfumerie & Kimya Mirası
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playSwellSound();
            }}
            className="flex items-center gap-1.5 rounded-full border border-[#c5a880]/30 bg-[#111722] px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:text-white hover:border-[#c5a880] transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} className="text-[#c5a880]" /> Ses Açık
              </>
            ) : (
              <>
                <VolumeX size={14} /> Ses Kapalı
              </>
            )}
          </button>

          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 rounded-full border border-[#c5a880]/40 bg-[#141b24] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#dfcca8] hover:bg-[#c5a880] hover:text-[#070a0e] transition-all cursor-pointer shadow-lg"
          >
            <span>Geç (ESC)</span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Merkez Sinematik Sahne */}
      <div className="relative z-20 mx-auto max-w-2xl px-6 text-center my-auto flex flex-col items-center justify-center">
        {/* Aşama 0: Kimya & Moleküler Formülasyon */}
        {phase === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/30 bg-[#c5a880]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#dfcca8]">
              <FlaskConical size={14} className="text-[#c5a880]" />
              <span>AŞAMA 1 · MOLEKÜLER FORMÜLASYON</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif-luxury tracking-tight text-white leading-tight">
              Kimya Mühendisliğinin <br />
              <span className="italic font-normal gold-shimmer">Hassas Dengesi</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Mardin Organize Sanayi laboratuvarlarında saflaştırılan %80 saf doğal etil alkol ve botanik esansiyel koku molekülleri sentezleniyor.
            </p>
          </div>
        )}

        {/* Aşama 1: Doğal Taş Kristalleşmesi */}
        {phase === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/30 bg-[#c5a880]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#dfcca8]">
              <Gem size={14} className="text-[#c5a880]" />
              <span>AŞAMA 2 · DOĞAL TAŞ & MEZOPOTAMYA MİRASI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif-luxury tracking-tight text-white leading-tight">
              Akik Taşı ve Pembe Kuvarsın <br />
              <span className="italic font-normal gold-shimmer">Kadim Enerjisi</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Yeryüzünün milyonlarca yılda kristalleşen hakiki akik taşları, Mezopotamya&apos;nın bergamot ve çiçek esanslarıyla birleşiyor.
            </p>
          </div>
        )}

        {/* Aşama 2: Büyük Sentez & Girdap */}
        {phase === 2 && (
          <div className="space-y-4 animate-in fade-in zoom-in-90 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/40 bg-[#c5a880]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#dfcca8]">
              <Sparkles size={14} className="text-[#c5a880]" />
              <span>AŞAMA 3 · BÜYÜK SENTEZ VE DOĞUŞ</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif-luxury tracking-tight text-white leading-tight">
              Koku & Taş Birleşiyor...
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Patentli formülasyonla, akik kristallerinin yaydığı piezoelektrik titreşimler esansın kalıcılığını mühürlüyor.
            </p>
          </div>
        )}

        {/* Aşama 3: Eşsiz Kolonyanın Ortaya Çıkışı & Marka Reveal */}
        {phase === 3 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-1000 flex flex-col items-center">
            {/* Lüks 3D Şişe Kartı */}
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-7 rounded-t bg-gradient-to-r from-[#8f7351] via-[#dfcca8] to-[#8f7351] shadow-md border-t border-amber-100/50" />
              <div className="w-12 h-2.5 bg-[#c5a880]" />
              <div className="relative w-36 h-48 rounded-xl border-2 border-white/30 bg-gradient-to-b from-white/20 via-white/5 to-white/15 backdrop-blur-md shadow-[0_0_60px_rgba(197,168,128,0.35)] flex flex-col justify-between p-3.5 overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#c5a880]/40 to-transparent" />
                <div className="absolute bottom-2 inset-x-3 flex justify-around">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#c5a880] opacity-90 shadow-sm" />
                  <span className="w-4 h-4 rounded-sm bg-[#dfcca8] opacity-80 shadow-sm" />
                  <span className="w-3 h-3 rounded-sm bg-[#8f7351] opacity-75 shadow-sm" />
                </div>
                <div className="relative z-10 border border-[#c5a880]/70 bg-black/75 px-2 py-1.5 text-center my-auto rounded">
                  <span className="block text-[7px] font-black tracking-widest text-[#dfcca8]">
                    DR. MARS
                  </span>
                  <span className="block text-[6px] tracking-wider text-white/90 uppercase">
                    EAU DE COLOGNE
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a880]">
                EŞSİZ KOLONYANIN DOĞUŞU TAMAMLANDI
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold tracking-tight text-white">
                Modern Kolonyanın Zirvesi.
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                Her damlasında kimya mühendisliği ustalığı, Mezopotamya&apos;nın kadim kokuları ve şifalı akik taşları.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c5a880] px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#070a0e] shadow-2xl hover:bg-[#dfcca8] transition-all transform hover:scale-105 cursor-pointer"
            >
              Koleksiyonu Keşfet <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Alt Zaman Çizelgesi (İlerleme Çubuğu) */}
      <div className="relative z-20 p-6 sm:px-12 backdrop-blur-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-4">
            <span className={phase === 0 ? "text-[#dfcca8] font-bold" : ""}>1. Kimya</span>
            <span>·</span>
            <span className={phase === 1 ? "text-[#dfcca8] font-bold" : ""}>2. Akik Taşı</span>
            <span>·</span>
            <span className={phase === 2 ? "text-[#dfcca8] font-bold" : ""}>3. Sentez</span>
            <span>·</span>
            <span className={phase === 3 ? "text-[#dfcca8] font-bold" : ""}>4. Doğuş</span>
          </div>
          <button
            onClick={handleClose}
            className="hover:text-white transition-colors cursor-pointer text-xs"
          >
            Atla (ESC)
          </button>
        </div>

        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#91754f] via-[#c5a880] to-[#dfcca8] transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ReplayIntroButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#c5a880]/30 bg-[#121822] px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#dfcca8] hover:bg-[#1a2330] hover:border-[#c5a880] transition-all cursor-pointer backdrop-blur"
        title="Kimya ve Kolonyanın Doğuş Hikayesini İzle"
      >
        <Sparkles size={14} className="text-[#c5a880]" />
        <span className="hidden sm:inline">Hikayeyi İzle</span>
      </button>

      {show && <IntroCinematic onComplete={() => setShow(false)} autoPlayOnce={false} />}
    </>
  );
}
