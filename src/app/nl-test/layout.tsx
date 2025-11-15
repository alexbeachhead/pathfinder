'use client';

import { AdaptiveDifficultyProvider } from '@/app/features/nl-test/components/AdaptiveDifficultyContext';

export default function NLTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdaptiveDifficultyProvider>
      {children}
    </AdaptiveDifficultyProvider>
  );
}
