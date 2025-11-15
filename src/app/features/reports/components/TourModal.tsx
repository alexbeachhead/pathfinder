'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard } from '@/components/ui/ThemedCard';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Image,
  Grid3X3,
  Table,
  Brain,
} from 'lucide-react';

interface TourSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  componentName: string;
}

const tourSlides: TourSlide[] = [
  {
    title: 'Welcome to Reports',
    description:
      'This interactive dashboard provides a comprehensive view of your test results. Navigate through different sections to analyze test health, visual regressions, and AI-powered insights.',
    icon: <BarChart3 className="w-8 h-8" />,
    componentName: 'Overview',
  },
  {
    title: 'Report Overview',
    description:
      'Get a high-level summary of your test run with key metrics like pass/fail rates, total tests, and execution time. Quickly identify issues at a glance.',
    icon: <BarChart3 className="w-8 h-8" />,
    componentName: 'ReportOverview',
  },
  {
    title: 'AI Visual Analysis',
    description:
      'Powered by Google Gemini, this section automatically detects visual, functional, and accessibility issues in your screenshots. Run AI analysis to get intelligent insights.',
    icon: <Brain className="w-8 h-8" />,
    componentName: 'AIAnalysis',
  },
  {
    title: 'Error Timeline',
    description:
      'Visualize when and where errors occurred during test execution. The timeline helps you understand error patterns and identify critical failure points.',
    icon: <Clock className="w-8 h-8" />,
    componentName: 'ErrorTimeline',
  },
  {
    title: 'Screenshot Comparison',
    description:
      'Compare screenshots side-by-side to identify visual regressions. Use the slider to see differences between expected and actual results.',
    icon: <Image className="w-8 h-8" />,
    componentName: 'ScreenshotComparison',
  },
  {
    title: 'Viewport Grid',
    description:
      'View test results across different screen sizes and devices. Quickly spot responsive design issues and viewport-specific failures.',
    icon: <Grid3X3 className="w-8 h-8" />,
    componentName: 'ViewportGrid',
  },
  {
    title: 'Test Results Table',
    description:
      'Dive into detailed test results with sortable columns, filters, and expandable error details. Export data in various formats for further analysis.',
    icon: <Table className="w-8 h-8" />,
    componentName: 'TestResultsTable',
  },
];

interface TourModalProps {
  onClose: () => void;
}

export function TourModal({ onClose }: TourModalProps) {
  const { currentTheme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem('pathfinder-reports-tour-completed', 'true');
    onClose();
  };

  const completeTour = () => {
    localStorage.setItem('pathfinder-reports-tour-completed', 'true');
    onClose();
  };

  const slide = tourSlides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      data-testid="tour-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <ThemedCard variant="glow" className="relative">
          {/* Close Button */}
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-opacity-20"
            style={{
              color: currentTheme.colors.text.tertiary,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.primary}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            data-testid="tour-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="px-8 py-6 min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center text-center"
              >
                {/* Icon */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}30 0%, ${currentTheme.colors.secondary}30 100%)`,
                    borderColor: `${currentTheme.colors.primary}50`,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                >
                  <span style={{ color: currentTheme.colors.accent }}>
                    {slide.icon}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {slide.title}
                </h2>

                {/* Description */}
                <p
                  className="text-lg leading-relaxed max-w-lg"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mt-8 mb-6">
              {tourSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: currentSlide === index ? '32px' : '8px',
                    backgroundColor:
                      currentSlide === index
                        ? currentTheme.colors.primary
                        : `${currentTheme.colors.text.tertiary}40`,
                  }}
                  data-testid={`tour-progress-${index}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <ThemedButton
                variant="ghost"
                size="md"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                leftIcon={<ChevronLeft className="w-5 h-5" />}
                data-testid="tour-prev-btn"
              >
                Previous
              </ThemedButton>

              <div className="flex gap-3">
                {currentSlide < tourSlides.length - 1 ? (
                  <>
                    <ThemedButton
                      variant="secondary"
                      size="md"
                      onClick={skipTour}
                      data-testid="tour-skip-btn"
                    >
                      Skip Tour
                    </ThemedButton>
                    <ThemedButton
                      variant="primary"
                      size="md"
                      onClick={nextSlide}
                      rightIcon={<ChevronRight className="w-5 h-5" />}
                      data-testid="tour-next-btn"
                    >
                      Next
                    </ThemedButton>
                  </>
                ) : (
                  <ThemedButton
                    variant="glow"
                    size="md"
                    onClick={completeTour}
                    data-testid="tour-finish-btn"
                  >
                    Get Started
                  </ThemedButton>
                )}
              </div>
            </div>
          </div>
        </ThemedCard>
      </motion.div>
    </div>
  );
}
