'use client';

import { motion } from 'framer-motion';
import { MascotConfig, generateMascotSVG, getMascotDescription } from '@/lib/mascot/mascotGenerator';
import { useMemo } from 'react';

interface MascotAvatarProps {
  config: MascotConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function MascotAvatar({ config, size = 'md', animate = true, className = '' }: MascotAvatarProps) {
  const svgContent = useMemo(() => generateMascotSVG(config), [config]);
  const description = useMemo(() => getMascotDescription(config.type), [config.type]);
  const pixelSize = sizeMap[size];

  const animationVariants = {
    idle: {
      y: 0,
      rotate: 0,
      scale: 1,
    },
    bounce: {
      y: [-2, 2, -2],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    wiggle: {
      rotate: [-3, 3, -3, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
      initial="idle"
      animate={animate ? 'bounce' : 'idle'}
      whileHover={animate ? 'wiggle' : undefined}
      variants={animationVariants}
      data-testid="mascot-avatar"
      aria-label={description}
      role="img"
    >
      <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
        }}
      />
    </motion.div>
  );
}
