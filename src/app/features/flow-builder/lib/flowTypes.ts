// Flow Builder Types

export type StepType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'assert'
  | 'screenshot'
  | 'wait'
  | 'hover'
  | 'select'
  | 'verify';

export type QuestionIntent =
  | 'navigation'
  | 'interaction'
  | 'validation'
  | 'visual'
  | 'data-entry'
  | 'waiting';

export interface FlowStep {
  id: string;
  type: StepType;
  order: number;
  config: FlowStepConfig;
}

export interface FlowStepConfig {
  description: string;
  selector?: string;
  value?: string;
  url?: string;
  assertion?: string;
  timeout?: number;
  expectedResult?: string;
}

export interface TestFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  viewport?: string;
  targetUrl?: string;
  metadata?: FlowMetadata;
}

export interface FlowMetadata {
  createdAt: string;
  updatedAt: string;
  category?: string;
  difficulty?: number;
  estimatedTime?: number;
}

export interface PaletteItem {
  type: StepType;
  label: string;
  description: string;
  icon: string;
  intent: QuestionIntent;
  defaultConfig: Partial<FlowStepConfig>;
  category: 'action' | 'assertion' | 'utility';
}

export interface FlowBuilderState {
  flow: TestFlow;
  selectedStepId: string | null;
  isDirty: boolean;
}
