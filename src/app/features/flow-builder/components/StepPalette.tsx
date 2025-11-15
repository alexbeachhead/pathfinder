'use client';

import { useTheme } from '@/lib/stores/appStore';
import { PALETTE_ITEMS, PALETTE_CATEGORIES, getPaletteItemsByCategory } from '../lib/palettes';
import { PaletteItem } from '../lib/flowTypes';
import {
  ArrowRight,
  MousePointer,
  Type,
  List,
  Move,
  CheckCircle,
  Eye,
  Camera,
  Clock,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ArrowRight,
  MousePointer,
  Type,
  List,
  Move,
  CheckCircle,
  Eye,
  Camera,
  Clock,
};

interface StepPaletteProps {
  onSelectItem: (item: PaletteItem) => void;
}

export function StepPalette({ onSelectItem }: StepPaletteProps) {
  const { currentTheme } = useTheme();

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  return (
    <div className="space-y-4">
      {PALETTE_CATEGORIES.map(category => {
        const items = getPaletteItemsByCategory(category.id as 'action' | 'assertion' | 'utility');

        return (
          <div key={category.id}>
            <h3
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: currentTheme.colors.text.tertiary }}
            >
              {category.description}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {items.map(item => {
                const IconComponent = iconMap[item.icon];

                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => onSelectItem(item)}
                    className="p-3 rounded cursor-move transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: currentTheme.colors.border,
                    }}
                    data-testid={`palette-item-${item.type}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                        style={{
                          backgroundColor: category.color + '20',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: category.color + '40',
                        }}
                      >
                        {IconComponent && (
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color: category.color }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: currentTheme.colors.text.primary }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: currentTheme.colors.text.tertiary }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
