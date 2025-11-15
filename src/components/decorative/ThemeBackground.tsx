'use client';

import { useTheme } from '@/lib/stores/appStore';
import { motion } from 'framer-motion';
import { Theme } from '@/lib/theme';

export function ThemeBackground() {
  const { themeId, currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div
        className="absolute inset-0"
        style={{ background: currentTheme.colors.background }}
      />

      {/* Theme-specific decorations */}
      {themeId === 'cyber' && <CyberBackground theme={currentTheme} />}
      {themeId === 'crimson' && <CrimsonBackground theme={currentTheme} />}
      {themeId === 'slate' && <SlateBackground theme={currentTheme} />}
    </div>
  );
}

// Helper to render grid background
function GridBackground({
  opacity,
  color,
  lineWidth,
  gridSize
}: {
  opacity: string;
  color: string;
  lineWidth: string;
  gridSize: string;
}) {
  return (
    <div
      className={`absolute inset-0 ${opacity}`}
      style={{
        backgroundImage: `
          linear-gradient(${color} ${lineWidth}, transparent ${lineWidth}),
          linear-gradient(90deg, ${color} ${lineWidth}, transparent ${lineWidth})
        `,
        backgroundSize: gridSize,
      }}
    />
  );
}

// Helper to render corner SVG decoration
function CornerDecoration({
  position,
  rotation,
  primaryColor,
  accentColor
}: {
  position: string;
  rotation: string;
  primaryColor: string;
  accentColor: string;
}) {
  return (
    <div className={`absolute ${position} w-32 h-32 opacity-20 ${rotation}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 20 L 20 20 L 20 0" stroke={primaryColor} strokeWidth="2" />
        <circle cx="20" cy="20" r="3" fill={accentColor} />
      </svg>
    </div>
  );
}

// Cyber Blueprint Background
function CyberBackground({ theme }: { theme: Theme }) {
  return (
    <>
      {/* Blueprint grid - fine lines */}
      <GridBackground
        opacity="opacity-20"
        color={`${theme.colors.primary}30`}
        lineWidth="1px"
        gridSize="40px 40px"
      />

      {/* Blueprint grid - major lines */}
      <GridBackground
        opacity="opacity-10"
        color={`${theme.colors.primary}50`}
        lineWidth="2px"
        gridSize="200px 200px"
      />

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)`,
          boxShadow: `0 0 10px ${theme.colors.accent}`,
        }}
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Corner decorations */}
      <CornerDecoration
        position="top-8 left-8"
        rotation=""
        primaryColor={theme.colors.primary}
        accentColor={theme.colors.accent}
      />

      <CornerDecoration
        position="bottom-8 right-8"
        rotation="rotate-180"
        primaryColor={theme.colors.primary}
        accentColor={theme.colors.accent}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/50 via-transparent to-gray-950/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-transparent to-gray-950/50" />
    </>
  );
}

// Helper for corner accent lines
interface CornerLinePosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width: string;
  height: string;
}

function CornerAccentLines({ theme }: { theme: Theme }) {
  const positions: CornerLinePosition[] = [
    { top: 0, left: 0, width: '200px', height: '1px' },
    { top: 0, left: 0, width: '1px', height: '200px' },
    { top: 0, right: 0, width: '200px', height: '1px' },
    { top: 0, right: 0, width: '1px', height: '200px' },
    { bottom: 0, left: 0, width: '200px', height: '1px' },
    { bottom: 0, left: 0, width: '1px', height: '200px' },
    { bottom: 0, right: 0, width: '200px', height: '1px' },
    { bottom: 0, right: 0, width: '1px', height: '200px' },
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            ...pos,
            background: `linear-gradient(${i % 2 === 0 ? '90deg' : '180deg'}, ${theme.colors.primary}, transparent)`,
          }}
        />
      ))}
    </>
  );
}

// Crimson Dark Background
function CrimsonBackground({ theme }: { theme: Theme }) {
  return (
    <>
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at top, ${theme.colors.primary}10, transparent 50%)`,
        }}
      />

      {/* Minimal grid - very subtle */}
      <GridBackground
        opacity="opacity-5"
        color={`${theme.colors.primary}60`}
        lineWidth="1px"
        gridSize="80px 80px"
      />

      {/* Corner accent lines */}
      <CornerAccentLines theme={theme} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/50" />
    </>
  );
}

// Golden Slate Background
function SlateBackground({ theme }: { theme: Theme }) {
  const cornerPositions: Array<{ top?: string; left?: string; right?: string; bottom?: string }> = [
    { top: '3rem', left: '3rem' },
    { top: '3rem', right: '3rem' },
    { bottom: '3rem', right: '3rem' },
    { bottom: '3rem', left: '3rem' },
  ];

  return (
    <>
      {/* Elegant gradient overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.colors.surface}80, transparent 70%)`,
        }}
      />

      {/* Medium gray grid */}
      <GridBackground
        opacity="opacity-15"
        color={`${theme.colors.primary}50`}
        lineWidth="1px"
        gridSize="60px 60px"
      />

      {/* Golden accent corners */}
      {cornerPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full opacity-40"
          style={{
            ...pos,
            background: theme.colors.accent,
            boxShadow: `0 0 10px ${theme.colors.accent}`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Elegant border lines */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-px opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 right-1/4 h-px opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent)`,
        }}
      />

      {/* Small golden decorative elements */}
      <motion.div
        className="absolute top-1/3 right-16 w-1 h-8 opacity-30"
        style={{
          background: `linear-gradient(180deg, ${theme.colors.accent}, transparent)`,
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scaleY: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </>
  );
}
