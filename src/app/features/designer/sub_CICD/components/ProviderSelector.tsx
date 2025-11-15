'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { CIProvider } from '../lib/ciHelpers';
import { Github, GitBranch } from 'lucide-react';

interface ProviderSelectorProps {
  onSelect: (provider: CIProvider) => void;
}

const providers = [
  {
    id: 'github' as CIProvider,
    name: 'GitHub Actions',
    description: 'Generate workflow for GitHub repositories',
    icon: Github,
    color: '#22d3ee',
  },
  {
    id: 'gitlab' as CIProvider,
    name: 'GitLab CI/CD',
    description: 'Generate pipeline for GitLab repositories',
    icon: GitBranch,
    color: '#f59e0b',
  },
];

export function ProviderSelector({ onSelect }: ProviderSelectorProps) {
  const { currentTheme } = useTheme();

  return (
    <div className="space-y-6">
      <motion.p
        className="text-center text-lg"
        style={{ color: currentTheme.colors.text.secondary }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose your CI/CD provider to generate a ready-to-use pipeline configuration
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider, index) => {
          const Icon = provider.icon;

          return (
            <motion.button
              key={provider.id}
              onClick={() => onSelect(provider.id)}
              className="group relative p-8 rounded-xl border-2 transition-all duration-300"
              style={{
                borderColor: currentTheme.colors.border,
                backgroundColor: currentTheme.colors.surface,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                borderColor: provider.color,
              }}
              whileTap={{ scale: 0.98 }}
              data-testid={`select-${provider.id}-btn`}
            >
              {/* Hover Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${provider.color}15, transparent 70%)`,
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon
                    className="w-16 h-16"
                    style={{ color: currentTheme.colors.accent }}
                  />

                  {/* Icon Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-50"
                    style={{ backgroundColor: provider.color }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {provider.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    {provider.description}
                  </p>
                </div>

                {/* Arrow indicator on hover */}
                <motion.div
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: provider.color }}
                  initial={{ opacity: 0, x: -5 }}
                  whileHover={{ opacity: 1, x: 0 }}
                >
                  <span>Get Started</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    →
                  </motion.span>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
