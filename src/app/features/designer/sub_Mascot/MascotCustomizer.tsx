'use client';

import { useTheme } from '@/lib/stores/appStore';
import { MascotConfig } from '@/lib/types';
import { MascotAvatar } from '@/app/features/designer/sub_Mascot/components/MascotAvatar';
import { Palette } from 'lucide-react';

interface MascotCustomizerProps {
  config: MascotConfig;
  onChange: (config: MascotConfig) => void;
}

const mascotTypes: Array<{ type: MascotConfig['type']; label: string; description: string }> = [
  { type: 'robot', label: 'Robot', description: 'UI automation' },
  { type: 'wizard', label: 'Wizard', description: 'Auto-generation' },
  { type: 'ninja', label: 'Ninja', description: 'Fast testing' },
  { type: 'explorer', label: 'Explorer', description: 'Discovery' },
  { type: 'detective', label: 'Detective', description: 'Investigation' },
];

const colorPresets = [
  { name: 'Cyber Blue', primary: '#06b6d4', secondary: '#3b82f6', accent: '#22d3ee' },
  { name: 'Crimson Red', primary: '#ef4444', secondary: '#991b1b', accent: '#fbbf24' },
  { name: 'Golden Slate', primary: '#64748b', secondary: '#475569', accent: '#fbbf24' },
  { name: 'Purple Magic', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#fbbf24' },
  { name: 'Green Forest', primary: '#10b981', secondary: '#059669', accent: '#fbbf24' },
];

export function MascotCustomizer({ config, onChange }: MascotCustomizerProps) {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
        <h3 className="font-medium text-sm" style={{ color: currentTheme.colors.text.primary }}>
          Test Suite Mascot
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Mascot Preview */}
        <div
          className="p-4 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${currentTheme.colors.surface}80`,
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: currentTheme.colors.border,
          }}
          data-testid="mascot-preview"
        >
          <MascotAvatar config={config} size="xl" animate={true} />
        </div>

        {/* Mascot Type Selection */}
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
            Mascot Type
          </label>
          <div className="grid grid-cols-5 gap-2">
            {mascotTypes.map((mascot) => (
              <button
                key={mascot.type}
                onClick={() => onChange({ ...config, type: mascot.type })}
                className="p-2 rounded-lg text-center transition-all hover:scale-105"
                style={{
                  backgroundColor:
                    config.type === mascot.type
                      ? `${currentTheme.colors.primary}20`
                      : `${currentTheme.colors.surface}80`,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: config.type === mascot.type ? currentTheme.colors.primary : currentTheme.colors.border,
                }}
                data-testid={`mascot-type-${mascot.type}`}
              >
                <MascotAvatar config={{ ...config, type: mascot.type }} size="sm" animate={false} />
                <p className="text-xs mt-1 font-medium" style={{ color: currentTheme.colors.text.primary }}>
                  {mascot.label}
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                  {mascot.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Customization */}
      <div className="space-y-2">
        <label className="block text-xs font-medium mb-2" style={{ color: currentTheme.colors.text.secondary }}>
          Color Scheme
        </label>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => onChange({ ...config, colorScheme: 'default' })}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor:
                config.colorScheme === 'default'
                  ? `${currentTheme.colors.primary}20`
                  : `${currentTheme.colors.surface}80`,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: config.colorScheme === 'default' ? currentTheme.colors.primary : currentTheme.colors.border,
              color: currentTheme.colors.text.primary,
            }}
            data-testid="color-scheme-default"
          >
            Default
          </button>

          <button
            onClick={() => onChange({ ...config, colorScheme: 'custom' })}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor:
                config.colorScheme === 'custom'
                  ? `${currentTheme.colors.primary}20`
                  : `${currentTheme.colors.surface}80`,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: config.colorScheme === 'custom' ? currentTheme.colors.primary : currentTheme.colors.border,
              color: currentTheme.colors.text.primary,
            }}
            data-testid="color-scheme-custom"
          >
            Custom Colors
          </button>
        </div>

        {config.colorScheme === 'custom' && (
          <div className="mt-3 space-y-3 p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.surface}40` }}>
            <p className="text-xs mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Choose a preset or customize:
            </p>

            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    onChange({
                      ...config,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent,
                    })
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${currentTheme.colors.surface}80`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: currentTheme.colors.border,
                  }}
                  data-testid={`color-preset-${preset.name.toLowerCase().replace(' ', '-')}`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`,
                    }}
                  />
                  <span style={{ color: currentTheme.colors.text.primary }}>{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Primary
                </label>
                <input
                  type="color"
                  value={config.primaryColor || '#06b6d4'}
                  onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                  data-testid="color-picker-primary"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Secondary
                </label>
                <input
                  type="color"
                  value={config.secondaryColor || '#3b82f6'}
                  onChange={(e) => onChange({ ...config, secondaryColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                  data-testid="color-picker-secondary"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  Accent
                </label>
                <input
                  type="color"
                  value={config.accentColor || '#22d3ee'}
                  onChange={(e) => onChange({ ...config, accentColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                  data-testid="color-picker-accent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
