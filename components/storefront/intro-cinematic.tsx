"use client";

import { useEffect, useRef, useState } from "react";
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

  // Check if first visit
  useEffect(() => {
    if (!autoPlayOnce) {
      setIsOpen(true);
      return;
    }
    const seen = sessionStorage.getItem("dr_mars_cinematic_seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, [autoPlayOnce]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("dr_mars_cinematic_seen", "true");
    if (onComplete) onComplete();
  };

  // Sound generator
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

      // Ethereal chord
      const freqs = [196, 246.94, 293.66, 392]; // G major
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.6);
      });
    } catch {
      // sessizce geç
    }
  };

  // Keyboard shortcut: ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timeline Progress Controller
  useEffect(() => {
    if (!isOpen) return;

    const totalDuration = 7000; // 7 seconds
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(pct);

      if (elapsed < 2000) {
        setPhase(0); // Atoms & Chemistry
      } else if (elapsed < 4200) {
        setPhase(1); // Gemstones & Botany
      } else if (elapsed < 6000) {
        setPhase(2); // Synthesis & Cologne Genesis
      } else {
        setPhase(3); // Brand Reveal
      }

      if (elapsed >= totalDuration) {
        clearInterval(timer);
        setTimeout(handleClose, 1200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Canvas Atomic, Molecular & Particle Physics Simulation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes for atomic bonds and fusion
    type AtomNode = {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      orbitRadius: number;
      angle: number;
      speed: number;
      color: string;
      label?: string;
    };

    const atoms: AtomNode[] = [];
    const colors = ["#caff73", "#b0e03e", "#4ecdc4", "#f4a261", "#e76f51", "#ffffff"];
    const labels = ["C10H16", "C2H5OH", "SiO2", "%80 ALKOL", "BERGAMOT", "AKİK TAŞI", "MİSK"];

    for (let i = 0; i < 70; i++) {
      atoms.push({
        x: width / 2,
        y: height / 2,
        baseX: width / 2 + (Math.random() - 0.5) * 600,
        baseY: height / 2 + (Math.random() - 0.5) * 450,
        radius: Math.random() * 3 + 2,
        orbitRadius: Math.random() * 240 + 40,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[i % colors.length],
        label: i < labels.length ? labels[i] : undefined,
      });
    }

    let time = 0;

    const render = () => {
      ctx.fillStyle = "rgba(11, 20, 29, 0.22)"; // Motion trail
      ctx.fillRect(0, 0, width, height);

      time += 0.02;
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Orbit Rings (Phase 0)
      if (phase === 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(202, 255, 115, 0.15)";
        ctx.lineWidth = 1;
        for (let r = 70; r <= 280; r += 70) {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, r, r * 0.55, time * 0.3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Gemstone Crystal Lattice (Phase 1)
      if (phase === 1) {
        ctx.save();
        ctx.strokeStyle = "rgba(78, 205, 196, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 + time * 0.2;
          const gx = centerX + Math.cos(a) * 160;
          const gy = centerY + Math.sin(a) * 160;
          if (i === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Render each particle / atom
      atoms.forEach((atom, idx) => {
        atom.angle += atom.speed;

        if (phase === 0) {
          // Atomic orbital movement
          atom.x = centerX + Math.cos(atom.angle) * atom.orbitRadius;
          atom.y = centerY + Math.sin(atom.angle) * (atom.orbitRadius * 0.55);
        } else if (phase === 1) {
          // Crystallization clustering
          const targetX = centerX + Math.cos(atom.angle * 2) * (atom.orbitRadius * 0.7);
          const targetY = centerY + Math.sin(atom.angle * 2) * (atom.orbitRadius * 0.7);
          atom.x += (targetX - atom.x) * 0.06;
          atom.y += (targetY - atom.y) * 0.06;
        } else if (phase === 2) {
          // Vortex suction into center (The Genesis)
          atom.orbitRadius *= 0.985;
          atom.x += (centerX - atom.x) * 0.04;
          atom.y += (centerY - atom.y) * 0.04;
        } else {
          // Aura expansion outwards around the bottle
          const outRadius = 220 + Math.sin(time + idx) * 30;
          atom.x = centerX + Math.cos(atom.angle) * outRadius;
          atom.y = centerY + Math.sin(atom.angle) * outRadius;
        }

        // Draw connecting molecular bonds between nearby atoms
        for (let j = idx + 1; j < atoms.length; j++) {
          const other = atoms[j];
          const dist = Math.hypot(atom.x - other.x, atom.y - other.y);
          if (dist < 85) {
            ctx.strokeStyle = `rgba(202, 255, 115, ${0.35 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(atom.x, atom.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw atom node
        ctx.save();
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
        ctx.fillStyle = atom.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = atom.color;
        ctx.fill();

        // Draw molecular tag for special nodes
        if (atom.label && (phase === 0 || phase === 1)) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          ctx.font = "bold 9px monospace";
          ctx.fillText(atom.label, atom.x + 8, atom.y + 3);
        }
        ctx.restore();
      });

      // Center core pulse
      ctx.save();
      const pulseSize = phase === 2 ? 40 + Math.sin(time * 8) * 12 : 18 + Math.sin(time * 3) * 4;
      const grad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulseSize * 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, phase === 1 ? "#4ecdc4" : "#caff73");
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
  }, [isOpen, phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#0b141d] text-white select-none overflow-hidden animate-in fade-in duration-500">
      {/* Background Canvas Particle Universe */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="relative z-20 flex items-center justify-between p-6 sm:px-12 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-[#caff73]">
            <Atom size={18} className="animate-spin" />
          </div>
          <div>
            <span className="block text-[11px] font-black uppercase tracking-widest text-[#caff73]">
              DR MARS · ATELIER
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              Doğuş & Simya Deneyimi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playSwellSound();
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={15} className="text-[#caff73]" /> Ses Açık
              </>
            ) : (
              <>
                <VolumeX size={15} /> Ses Kapalı
              </>
            )}
          </button>

          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-stone-950 transition-all cursor-pointer shadow-lg"
          >
            <span>Geç</span>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage */}
      <div className="relative z-20 mx-auto max-w-2xl px-6 text-center my-auto flex flex-col items-center justify-center">
        {/* Phase 0: Chemistry & Atomic Formulation */}
        {phase === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#caff73]/40 bg-[#caff73]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#caff73]">
              <FlaskConical size={14} />
              <span>AŞAMA 1 · MOLEKÜLER FORMÜLASYON</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Kimya Mühendisliğinin <br />
              <span className="text-[#caff73] font-serif italic font-normal">Hassas Dengesi</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Mardin Organize Sanayi laboratuvarlarında saflaştırılan %80 doğal etil alkol ve esansiyel koku molekülleri sentezleniyor.
            </p>
          </div>
        )}

        {/* Phase 1: Gemstones & Botanical Crystallization */}
        {phase === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4ecdc4]/40 bg-[#4ecdc4]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#4ecdc4]">
              <Gem size={14} />
              <span>AŞAMA 2 · DOĞAL TAŞ & MEZOPOTAMYA SİMYASI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Akik Taşı ve Pembe Kuvarsın <br />
              <span className="text-[#4ecdc4] font-serif italic font-normal">Kadim Enerjisi</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Yeryüzünün milyonlarca yılda kristalleşen akik taşları, Mezopotamya&apos;nın bergamot ve çiçek esanslarıyla birleşiyor.
            </p>
          </div>
        )}

        {/* Phase 2: Genesis & Fusion */}
        {phase === 2 && (
          <div className="space-y-4 animate-in fade-in zoom-in-90 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
              <Sparkles size={14} className="text-[#caff73]" />
              <span>AŞAMA 3 · BÜYÜK SENTEZ VE DOĞUŞ</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-tight">
              Eşsiz Kolonya <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#caff73] via-white to-[#4ecdc4]">
                Şişeleniyor...
              </span>
            </h2>
          </div>
        )}

        {/* Phase 3: The Flacon Bottle Emergence & Grand Reveal */}
        {phase === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center">
            {/* 3D Glowing Bottle Hologram / Flacon */}
            <div className="relative w-32 sm:w-36 h-48 sm:h-52 rounded-2xl border-2 border-[#caff73]/80 bg-gradient-to-b from-white/20 via-[#caff73]/20 to-[#4ecdc4]/30 backdrop-blur-xl shadow-[0_0_60px_rgba(202,255,115,0.4)] flex flex-col justify-between p-3 animate-pulse">
              <div className="w-8 h-4 bg-gradient-to-r from-[#d4af37] to-[#aa8012] mx-auto rounded-t-sm" />
              <div className="my-auto text-center">
                <span className="text-[8px] font-black tracking-widest text-[#caff73] block uppercase">
                  DR MARS
                </span>
                <span className="text-xs font-black tracking-wider text-white block mt-0.5">
                  CITRUS NO. 01
                </span>
                <span className="text-[7px] text-stone-300 font-mono block mt-1">
                  AKİK TAŞLI KOLONYA
                </span>
              </div>
              <div className="text-[7px] text-center font-mono text-[#caff73]">
                %80 VOL · 250 ML
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                DR. MARS MODERN COLOGNE
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                Gelenekten ilham alan, bilim ve akik kristalleriyle üretilen eşsiz koku deneyimi hazır.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#caff73] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-stone-950 shadow-xl hover:bg-white transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>Mağazayı Keşfet</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Timeline Progress Bar */}
      <div className="relative z-20 p-6 sm:px-12">
        <div className="mx-auto max-w-xl space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
            <span>ATOMİK KİMYA</span>
            <span>DOĞAL AKİK TAŞI</span>
            <span>SENTEZ</span>
            <span>DR. MARS</span>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#caff73] via-[#4ecdc4] to-white transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Trigger Button to launch intro animation anytime
 */
export function ReplayIntroButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer backdrop-blur"
      >
        <Sparkles size={14} className="text-[#caff73] animate-pulse" />
        <span>Doğuş Hikayesini İzle</span>
      </button>

      {showModal && (
        <IntroCinematic
          autoPlayOnce={false}
          onComplete={() => setShowModal(false)}
        />
      )}
    </>
  );
}
