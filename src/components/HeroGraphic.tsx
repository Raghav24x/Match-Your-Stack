import { useEffect, useState } from "react";

const HeroGraphic = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const colors = {
    primary: "#2E82D6",
    navy: "#063264", 
    background: isDark ? "#081623" : "#FEF9F4",
    lines: isDark ? "rgba(255, 255, 255, 0.13)" : "rgba(6, 50, 100, 0.13)",
    cardBg: isDark ? "rgba(11, 30, 52, 0.8)" : "rgba(255, 255, 255, 0.9)",
    cardBorder: isDark ? "rgba(46, 130, 214, 0.2)" : "rgba(6, 50, 100, 0.1)"
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-auto"
        role="img"
        aria-label="Companies matched with Substack creators through a central hub"
      >
        <defs>
          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Subtle pulse animation */}
          <style>
            {`
              @media (prefers-reduced-motion: no-preference) {
                .hub-pulse {
                  animation: hub-pulse 3s ease-in-out infinite;
                }
                
                .connection-line {
                  animation: connection-flow 4s linear infinite;
                  stroke-dasharray: 8 4;
                }
              }
              
              @keyframes hub-pulse {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
              }
              
              @keyframes connection-flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 24; }
              }
            `}
          </style>
        </defs>

        {/* Background circuit pattern */}
        <g opacity="0.3">
          <path
            d="M50 100 L100 100 L100 80 L120 80"
            stroke={colors.lines}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M280 80 L300 80 L300 100 L350 100"
            stroke={colors.lines}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M50 200 L100 200 L100 220 L120 220"
            stroke={colors.lines}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M280 220 L300 220 L300 200 L350 200"
            stroke={colors.lines}
            strokeWidth="1"
            fill="none"
          />
        </g>

        {/* Company cards (left side) */}
        <g>
          {/* Company 1 */}
          <rect
            x="20"
            y="70"
            width="60"
            height="40"
            rx="8"
            fill={colors.cardBg}
            stroke={colors.cardBorder}
            strokeWidth="1"
          />
          <rect x="28" y="78" width="8" height="8" rx="2" fill={colors.navy} />
          <rect x="40" y="78" width="20" height="3" rx="1" fill={colors.lines} />
          <rect x="40" y="84" width="15" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="92" width="35" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="96" width="25" height="2" rx="1" fill={colors.lines} />

          {/* Company 2 */}
          <rect
            x="20"
            y="130"
            width="60"
            height="40"
            rx="8"
            fill={colors.cardBg}
            stroke={colors.cardBorder}
            strokeWidth="1"
          />
          <rect x="28" y="138" width="8" height="8" rx="2" fill={colors.primary} />
          <rect x="40" y="138" width="20" height="3" rx="1" fill={colors.lines} />
          <rect x="40" y="144" width="15" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="152" width="35" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="156" width="25" height="2" rx="1" fill={colors.lines} />

          {/* Company 3 */}
          <rect
            x="20"
            y="190"
            width="60"
            height="40"
            rx="8"
            fill={colors.cardBg}
            stroke={colors.cardBorder}
            strokeWidth="1"
          />
          <rect x="28" y="198" width="8" height="8" rx="2" fill={colors.navy} />
          <rect x="40" y="198" width="20" height="3" rx="1" fill={colors.lines} />
          <rect x="40" y="204" width="15" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="212" width="35" height="2" rx="1" fill={colors.lines} />
          <rect x="28" y="216" width="25" height="2" rx="1" fill={colors.lines} />
        </g>

        {/* Central Hub */}
        <g className="hub-pulse">
          <circle
            cx="200"
            cy="150"
            r="35"
            fill={colors.primary}
            filter="url(#glow)"
            opacity="0.9"
          />
          <circle
            cx="200"
            cy="150"
            r="28"
            fill="none"
            stroke={colors.background}
            strokeWidth="2"
            opacity="0.8"
          />
          <circle
            cx="200"
            cy="150"
            r="20"
            fill="none"
            stroke={colors.background}
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Stack icon in center */}
          <g transform="translate(200, 150)">
            <rect x="-8" y="-12" width="16" height="4" rx="2" fill={colors.background} />
            <rect x="-8" y="-6" width="16" height="4" rx="2" fill={colors.background} />
            <rect x="-8" y="0" width="16" height="4" rx="2" fill={colors.background} />
            <rect x="-8" y="6" width="16" height="4" rx="2" fill={colors.background} />
          </g>
        </g>

        {/* Creator avatars (right side) */}
        <g>
          {/* Creator 1 */}
          <circle cx="340" cy="90" r="20" fill={colors.cardBg} stroke={colors.cardBorder} strokeWidth="1" />
          <circle cx="340" cy="90" r="12" fill={colors.primary} />
          <text x="340" y="95" textAnchor="middle" fontSize="10" fill={colors.background} fontFamily="Inter, sans-serif" fontWeight="600">JD</text>

          {/* Creator 2 */}
          <circle cx="340" cy="140" r="20" fill={colors.cardBg} stroke={colors.cardBorder} strokeWidth="1" />
          <circle cx="340" cy="140" r="12" fill={colors.navy} />
          <text x="340" y="145" textAnchor="middle" fontSize="10" fill={colors.background} fontFamily="Inter, sans-serif" fontWeight="600">AS</text>

          {/* Creator 3 */}
          <circle cx="340" cy="190" r="20" fill={colors.cardBg} stroke={colors.cardBorder} strokeWidth="1" />
          <circle cx="340" cy="190" r="12" fill={colors.primary} />
          <text x="340" y="195" textAnchor="middle" fontSize="10" fill={colors.background} fontFamily="Inter, sans-serif" fontWeight="600">MK</text>

          {/* Creator 4 */}
          <circle cx="320" cy="215" r="18" fill={colors.cardBg} stroke={colors.cardBorder} strokeWidth="1" />
          <circle cx="320" cy="215" r="11" fill={colors.navy} />
          <text x="320" y="220" textAnchor="middle" fontSize="9" fill={colors.background} fontFamily="Inter, sans-serif" fontWeight="600">LR</text>

          {/* Creator 5 */}
          <circle cx="320" cy="65" r="18" fill={colors.cardBg} stroke={colors.cardBorder} strokeWidth="1" />
          <circle cx="320" cy="65" r="11" fill={colors.primary} />
          <text x="320" y="70" textAnchor="middle" fontSize="9" fill={colors.background} fontFamily="Inter, sans-serif" fontWeight="600">TB</text>
        </g>

        {/* Connection lines */}
        <g>
          {/* Company to hub connections */}
          <path
            d="M80 90 Q140 90 165 130"
            stroke={colors.primary}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />
          <path
            d="M80 150 L165 150"
            stroke={colors.primary}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />
          <path
            d="M80 210 Q140 210 165 170"
            stroke={colors.primary}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />

          {/* Hub to creator connections */}
          <path
            d="M235 130 Q280 90 320 90"
            stroke={colors.navy}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />
          <path
            d="M235 150 L320 140"
            stroke={colors.navy}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />
          <path
            d="M235 170 Q280 210 320 190"
            stroke={colors.navy}
            strokeWidth="2"
            fill="none"
            className="connection-line"
            opacity="0.7"
          />
          <path
            d="M225 125 Q270 70 305 65"
            stroke={colors.navy}
            strokeWidth="1.5"
            fill="none"
            className="connection-line"
            opacity="0.5"
          />
          <path
            d="M225 175 Q270 230 305 215"
            stroke={colors.navy}
            strokeWidth="1.5"
            fill="none"
            className="connection-line"
            opacity="0.5"
          />
        </g>

        {/* Floating connection indicators */}
        <g opacity="0.6">
          <circle cx="120" cy="120" r="2" fill={colors.primary}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="120" r="2" fill={colors.navy}>
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="180" r="2" fill={colors.primary}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
};

export default HeroGraphic;