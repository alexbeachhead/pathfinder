'use client';

import { useTheme } from '@/lib/stores/appStore';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { LogoTitle } from '@/components/logo/LogoTitle';

export function Header() {
  const { currentTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{
        borderBottom: `1px solid ${currentTheme.colors.border}`,
        background: `${currentTheme.colors.surface}cc`,
      }}
    >
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <LogoTitle theme={currentTheme} width={200} height={25} />
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
