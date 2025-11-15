/**
 * Mascot Generator - Generates playful mascot SVGs based on test suite name and actions
 */

export type MascotType = 'robot' | 'wizard' | 'ninja' | 'explorer' | 'detective';
export type MascotColorScheme = 'default' | 'team' | 'custom';

export interface MascotConfig {
  type: MascotType;
  colorScheme: MascotColorScheme;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

/**
 * Determines mascot type based on test suite name and keywords
 */
export function inferMascotType(suiteName: string, description?: string): MascotType {
  const text = `${suiteName} ${description || ''}`.toLowerCase();

  if (text.includes('ui') || text.includes('click') || text.includes('interact')) {
    return 'robot';
  }
  if (text.includes('magic') || text.includes('auto') || text.includes('generate')) {
    return 'wizard';
  }
  if (text.includes('fast') || text.includes('quick') || text.includes('speed')) {
    return 'ninja';
  }
  if (text.includes('explore') || text.includes('discover') || text.includes('search')) {
    return 'explorer';
  }
  if (text.includes('test') || text.includes('verify') || text.includes('check')) {
    return 'detective';
  }

  // Default to robot for generic test suites
  return 'robot';
}

/**
 * Get default colors for a mascot type
 */
export function getMascotDefaultColors(type: MascotType): { primary: string; secondary: string; accent: string } {
  const colorMap: Record<MascotType, { primary: string; secondary: string; accent: string }> = {
    robot: { primary: '#06b6d4', secondary: '#3b82f6', accent: '#22d3ee' },
    wizard: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#fbbf24' },
    ninja: { primary: '#ef4444', secondary: '#991b1b', accent: '#fbbf24' },
    explorer: { primary: '#10b981', secondary: '#059669', accent: '#fbbf24' },
    detective: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
  };

  return colorMap[type];
}

/**
 * Generate SVG for robot mascot
 */
function generateRobotSVG(primary: string, secondary: string, accent: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="30" y="40" width="40" height="45" rx="8" fill="${primary}" opacity="0.9"/>
      <rect x="33" y="43" width="34" height="39" rx="6" fill="${secondary}" opacity="0.3"/>

      <!-- Head -->
      <rect x="35" y="20" width="30" height="25" rx="6" fill="${primary}"/>
      <circle cx="43" cy="30" r="3" fill="${accent}"/>
      <circle cx="57" cy="30" r="3" fill="${accent}"/>

      <!-- Antenna -->
      <line x1="50" y1="20" x2="50" y2="12" stroke="${accent}" stroke-width="2"/>
      <circle cx="50" cy="10" r="3" fill="${accent}"/>

      <!-- Arms -->
      <rect x="20" y="50" width="8" height="20" rx="4" fill="${primary}"/>
      <rect x="72" y="50" width="8" height="20" rx="4" fill="${primary}"/>

      <!-- Mouse/Tool -->
      <ellipse cx="75" cy="75" rx="8" ry="6" fill="${secondary}" opacity="0.8"/>
      <rect x="73" y="72" width="4" height="3" rx="1" fill="${accent}"/>

      <!-- Details -->
      <rect x="45" y="55" width="10" height="2" rx="1" fill="${accent}" opacity="0.6"/>
      <rect x="45" y="60" width="10" height="2" rx="1" fill="${accent}" opacity="0.6"/>
      <rect x="45" y="65" width="10" height="2" rx="1" fill="${accent}" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Generate SVG for wizard mascot
 */
function generateWizardSVG(primary: string, secondary: string, accent: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Body/Robe -->
      <path d="M 50 85 L 35 55 L 40 35 L 60 35 L 65 55 Z" fill="${primary}" opacity="0.9"/>
      <path d="M 50 85 L 38 55 L 43 35 L 57 35 L 62 55 Z" fill="${secondary}" opacity="0.3"/>

      <!-- Head -->
      <circle cx="50" cy="25" r="12" fill="${primary}"/>
      <circle cx="46" cy="23" r="2" fill="${accent}"/>
      <circle cx="54" cy="23" r="2" fill="${accent}"/>

      <!-- Wizard Hat -->
      <path d="M 35 25 L 50 5 L 65 25 Z" fill="${primary}"/>
      <ellipse cx="50" cy="25" rx="15" ry="3" fill="${primary}"/>

      <!-- Stars on hat -->
      <circle cx="50" cy="15" r="1.5" fill="${accent}"/>
      <circle cx="45" cy="20" r="1" fill="${accent}" opacity="0.7"/>
      <circle cx="55" cy="18" r="1" fill="${accent}" opacity="0.7"/>

      <!-- Wand -->
      <line x1="65" y1="50" x2="80" y2="35" stroke="${accent}" stroke-width="2"/>
      <circle cx="80" cy="35" r="4" fill="${accent}"/>
      <circle cx="77" cy="32" r="1.5" fill="${secondary}"/>

      <!-- Magic sparkles -->
      <circle cx="72" cy="40" r="1" fill="${accent}" opacity="0.6"/>
      <circle cx="75" cy="45" r="1" fill="${accent}" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Generate SVG for ninja mascot
 */
function generateNinjaSVG(primary: string, secondary: string, accent: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <path d="M 35 85 L 40 50 L 45 40 L 55 40 L 60 50 L 65 85 Z" fill="${secondary}" opacity="0.9"/>

      <!-- Head/Mask -->
      <circle cx="50" cy="30" r="14" fill="${primary}"/>
      <rect x="38" y="26" width="24" height="8" fill="${secondary}"/>

      <!-- Eyes -->
      <rect x="42" y="28" width="6" height="3" rx="1" fill="${accent}"/>
      <rect x="52" y="28" width="6" height="3" rx="1" fill="${accent}"/>

      <!-- Headband -->
      <rect x="36" y="22" width="28" height="4" fill="${accent}"/>
      <path d="M 64 24 L 68 20 L 70 24 L 68 28 Z" fill="${accent}"/>

      <!-- Sword -->
      <rect x="20" y="55" width="3" height="25" rx="1" fill="${secondary}"/>
      <rect x="18" y="53" width="7" height="4" rx="1" fill="${primary}"/>
      <polygon points="21.5,45 21.5,53 23.5,53 23.5,45" fill="${accent}"/>

      <!-- Shuriken -->
      <g transform="translate(75, 65)">
        <circle r="5" fill="${accent}" opacity="0.3"/>
        <polygon points="0,-5 1,0 0,5 -1,0" fill="${accent}"/>
        <polygon points="-5,0 0,1 5,0 0,-1" fill="${accent}"/>
      </g>
    </svg>
  `;
}

/**
 * Generate SVG for explorer mascot
 */
function generateExplorerSVG(primary: string, secondary: string, accent: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="35" y="45" width="30" height="40" rx="6" fill="${primary}" opacity="0.9"/>
      <rect x="38" y="48" width="24" height="34" rx="4" fill="${secondary}" opacity="0.3"/>

      <!-- Head -->
      <circle cx="50" cy="30" r="12" fill="${primary}"/>
      <circle cx="46" cy="28" r="2" fill="${accent}"/>
      <circle cx="54" cy="28" r="2" fill="${accent}"/>
      <path d="M 46 34 Q 50 36 54 34" stroke="${accent}" stroke-width="1.5" fill="none"/>

      <!-- Explorer Hat -->
      <ellipse cx="50" cy="18" rx="16" ry="5" fill="${secondary}"/>
      <path d="M 34 18 L 38 25 L 62 25 L 66 18 Z" fill="${secondary}"/>
      <circle cx="50" cy="18" r="3" fill="${accent}"/>

      <!-- Backpack -->
      <rect x="58" y="50" width="12" height="20" rx="3" fill="${secondary}"/>
      <rect x="60" y="52" width="8" height="16" rx="2" fill="${primary}" opacity="0.5"/>

      <!-- Compass -->
      <circle cx="30" cy="60" r="6" fill="${accent}" opacity="0.8"/>
      <circle cx="30" cy="60" r="3" fill="${secondary}"/>
      <line x1="30" y1="57" x2="30" y2="60" stroke="${accent}" stroke-width="1"/>
    </svg>
  `;
}

/**
 * Generate SVG for detective mascot
 */
function generateDetectiveSVG(primary: string, secondary: string, accent: string): string {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Body/Coat -->
      <path d="M 40 85 L 42 50 L 45 40 L 55 40 L 58 50 L 60 85 Z" fill="${secondary}" opacity="0.9"/>
      <rect x="43" y="50" width="14" height="35" rx="2" fill="${primary}" opacity="0.3"/>

      <!-- Head -->
      <circle cx="50" cy="28" r="12" fill="${primary}"/>
      <circle cx="46" cy="26" r="2" fill="${accent}"/>
      <circle cx="54" cy="26" r="2" fill="${accent}"/>

      <!-- Detective Hat -->
      <ellipse cx="50" cy="16" rx="14" ry="4" fill="${secondary}"/>
      <rect x="38" y="16" width="24" height="6" rx="1" fill="${secondary}"/>

      <!-- Magnifying Glass -->
      <circle cx="72" cy="60" r="10" fill="transparent" stroke="${accent}" stroke-width="2"/>
      <circle cx="72" cy="60" r="8" fill="${accent}" opacity="0.2"/>
      <line x1="65" y1="67" x2="58" y2="74" stroke="${accent}" stroke-width="3"/>

      <!-- Pipe -->
      <path d="M 45 32 L 40 34 L 38 33 L 40 32 Z" fill="${secondary}"/>
      <ellipse cx="41" cy="33" rx="2" ry="3" fill="${secondary}"/>

      <!-- Collar -->
      <polygon points="45,40 50,42 55,40 55,38 45,38" fill="${accent}"/>
    </svg>
  `;
}

/**
 * Generate mascot SVG based on configuration
 */
export function generateMascotSVG(config: MascotConfig): string {
  const colors = config.colorScheme === 'custom' && config.primaryColor
    ? {
        primary: config.primaryColor,
        secondary: config.secondaryColor || config.primaryColor,
        accent: config.accentColor || config.primaryColor,
      }
    : getMascotDefaultColors(config.type);

  const generators: Record<MascotType, (p: string, s: string, a: string) => string> = {
    robot: generateRobotSVG,
    wizard: generateWizardSVG,
    ninja: generateNinjaSVG,
    explorer: generateExplorerSVG,
    detective: generateDetectiveSVG,
  };

  return generators[config.type](colors.primary, colors.secondary, colors.accent);
}

/**
 * Get mascot description for accessibility
 */
export function getMascotDescription(type: MascotType): string {
  const descriptions: Record<MascotType, string> = {
    robot: 'Friendly robot holding a mouse, representing UI automation',
    wizard: 'Wizard with a magic wand, representing automated test generation',
    ninja: 'Ninja with a sword, representing fast and stealthy testing',
    explorer: 'Explorer with a compass, representing test discovery',
    detective: 'Detective with magnifying glass, representing bug investigation',
  };

  return descriptions[type];
}
