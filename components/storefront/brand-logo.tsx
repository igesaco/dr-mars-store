import Link from "next/link";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  showSubtitle?: boolean;
}

export function BrandLogo({
  variant = "light",
  size = "md",
  href = "/",
  className = "",
  showSubtitle = true,
}: BrandLogoProps) {
  const isDark = variant === "dark";

  // Boyut ayarları
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const titleSize =
    size === "sm"
      ? "text-lg tracking-[0.22em]"
      : size === "lg"
      ? "text-2xl sm:text-3xl tracking-[0.26em]"
      : "text-xl sm:text-2xl tracking-[0.24em]";
  const subSize =
    size === "sm"
      ? "text-[7.5px] tracking-[0.3em]"
      : size === "lg"
      ? "text-[10px] tracking-[0.36em]"
      : "text-[8.5px] tracking-[0.32em]";

  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none ${className}`}>
      {/* Özel Tasarım Lüks Akik Taşı & Parfüm Damlası Monogram Amblemi */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Dış Geometrik Lüks Sekizgen Çerçeve (Akik Taşı Kesimi) */}
          <polygon
            points="24,2 38,8 46,24 38,40 24,46 10,40 2,24 10,8"
            stroke={isDark ? "#c5a880" : "#91754f"}
            strokeWidth="1.5"
            fill={isDark ? "#121922" : "#fbf9f5"}
            className="transition-colors"
          />

          {/* İç İnce Zarafet Çemberi */}
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke={isDark ? "#e6d7bc" : "#c5a880"}
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />

          {/* Merkezde Parfüm Esansı Kristali ve DM İmzası */}
          <path
            d="M24 12 L28 20 L24 25 L20 20 Z"
            fill="url(#goldGradient)"
          />
          <path
            d="M24 25 L28 29 L24 36 L20 29 Z"
            fill="url(#goldGradient)"
            opacity="0.85"
          />
          <circle cx="24" cy="24" r="2.5" fill={isDark ? "#fff" : "#91754f"} />

          {/* Altın Parıltı Gradyanı */}
          <defs>
            <linearGradient id="goldGradient" x1="20" y1="12" x2="28" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5e6cb" />
              <stop offset="0.5" stopColor="#c5a880" />
              <stop offset="1" stopColor="#8f7351" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Tipografi Bloğu */}
      <div className="flex flex-col items-start leading-none">
        <div
          className={`flex items-center font-black ${titleSize} ${
            isDark
              ? "text-[#f3ede2] group-hover:text-[#c5a880]"
              : "text-[#0b0f15] group-hover:text-[#8f7351]"
          } transition-colors`}
        >
          <span>DR</span>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full mx-1.5 ${
              isDark ? "bg-[#c5a880]" : "bg-[#91754f]"
            }`}
          />
          <span>MARS</span>
        </div>

        {showSubtitle && (
          <span
            className={`font-bold ${subSize} uppercase mt-1 ${
              isDark ? "text-[#c5a880]/90" : "text-[#8f7351]"
            } transition-colors`}
          >
            HAUTE PARFUMERIE · MARDİN
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-block outline-none">
      {content}
    </Link>
  );
}
