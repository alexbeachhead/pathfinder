// Database Models

export interface TestSuite {
  id: string;
  name: string;
  target_url: string;
  description?: string;
  mascot_config?: MascotConfig;
  created_at: string;
  updated_at: string;
}

export interface MascotConfig {
  type: 'robot' | 'wizard' | 'ninja' | 'explorer' | 'detective';
  colorScheme: 'default' | 'team' | 'custom';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface TestRun {
  id: string;
  suite_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  config?: ViewportConfig;
  created_at: string;
}

export interface TestResult {
  id: string;
  run_id: string;
  viewport: 'mobile' | 'tablet' | 'desktop';
  viewport_size?: string;
  test_name?: string;
  status: 'pass' | 'fail' | 'skipped';
  duration_ms?: number;
  screenshots?: string[];
  errors?: ErrorObject[];
  console_logs?: ConsoleLog[];
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  result_id: string;
  analysis_type: 'visual' | 'functional' | 'accessibility';
  findings?: Record<string, unknown>;
  severity: 'critical' | 'warning' | 'info';
  suggestions?: string;
  confidence_score?: number;
  created_at: string;
}

export interface TestCode {
  id: string;
  suite_id: string;
  code: string;
  language: 'javascript' | 'typescript';
  version: number;
  created_at: string;
}

export type CodeLanguage = 'javascript' | 'typescript';

// Supporting Types

export interface ViewportConfig {
  mobile?: ViewportSize;
  tablet?: ViewportSize;
  desktop?: ViewportSize;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ErrorObject {
  message: string;
  stack?: string;
  line?: number;
  column?: number;
}

export interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

// UI Component Types

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary' | 'outline';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'bordered' | 'elevated';

// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Test Configuration Types

export interface TestConfiguration {
  viewports: ('mobile' | 'tablet' | 'desktop')[];
  targetUrl: string;
  timeout?: number;
  retries?: number;
  captureScreenshots?: boolean;
  captureConsoleLogs?: boolean;
}

export interface PlaywrightConfig {
  headless: boolean;
  slowMo?: number;
  timeout?: number;
}

// Test Scenario Types (for AI-generated tests)

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'functional' | 'visual' | 'responsive' | 'accessibility';
  steps: TestStep[];
  expectedOutcomes: string[];
  viewports: string[];
  /** Optional URL for this scenario; overrides suite target_url when set */
  targetUrl?: string;
}

export interface TestStep {
  action: 'navigate' | 'click' | 'fill' | 'assert' | 'screenshot' | 'wait' | 'hover' | 'select';
  selector?: string;
  value?: string;
  description: string;
  pluginAction?: PluginStepData; // For plugin-based actions
}

export interface PluginStepData {
  pluginId: string;
  actionType: PluginActionType;
  parameters: Record<string, unknown>;
  metadata?: PluginMetadata;
}

export interface CodebaseAnalysis {
  framework: string;
  pages: PageAnalysis[];
  forms: FormAnalysis[];
  navigation: NavigationAnalysis;
}

export interface PageAnalysis {
  path: string;
  components: string[];
  interactions: string[];
}

export interface FormAnalysis {
  id: string;
  fields: FormField[];
  submitAction: string;
}

export interface FormField {
  name: string;
  type: string;
  required: boolean;
}

export interface NavigationAnalysis {
  links: NavLink[];
  dynamicRoutes: string[];
}

export interface NavLink {
  text: string;
  href: string;
}

export type PreviewMode = 'lightweight' | 'full';

export interface ScreenshotMetadata {
  viewportName: string;
  width: number;
  height: number;
  url: string;
  base64?: string;
  screenshotUrl?: string;
  previewMode?: PreviewMode;
  domSnapshot?: string; // HTML snapshot for lightweight mode
}

// Issue Tracker Integration Types

export type IssueTrackerType = 'jira' | 'github' | 'trello';

export interface TestIssueLink {
  id: string;
  result_id: string;
  ticket_id: string;
  tracker_type: IssueTrackerType;
  ticket_url: string;
  ticket_key: string;
  created_at: string;
}

// Branching & Merge Types

export interface TestSuiteBranch {
  id: string;
  suite_id: string;
  branch_name: string;
  parent_branch_id?: string;
  is_default: boolean;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BranchSnapshot {
  id: string;
  branch_id: string;
  test_code_id?: string;
  suite_config?: Record<string, unknown>;
  created_at: string;
}

export interface BranchDiff {
  id: string;
  source_branch_id: string;
  target_branch_id: string;
  diff_type: 'code' | 'config' | 'steps';
  changes: DiffChanges;
  created_at: string;
}

export interface DiffChanges {
  additions?: CodeChange[];
  deletions?: CodeChange[];
  modifications?: CodeChange[];
  summary?: string;
}

export interface CodeChange {
  line?: number;
  content: string;
  type: 'add' | 'remove' | 'modify';
  context?: string;
}

export interface MergeRequest {
  id: string;
  suite_id: string;
  source_branch_id: string;
  target_branch_id: string;
  status: 'open' | 'merged' | 'closed' | 'conflict';
  title: string;
  description?: string;
  created_by?: string;
  merged_by?: string;
  conflicts?: MergeConflict[];
  resolution?: ConflictResolution[];
  created_at: string;
  merged_at?: string;
  updated_at: string;
}

export interface MergeConflict {
  type: 'code' | 'config' | 'steps';
  section: string;
  sourceValue: string;
  targetValue: string;
  lineNumber?: number;
  description?: string;
}

export interface ConflictResolution {
  conflictIndex: number;
  resolution: 'accept_source' | 'accept_target' | 'accept_both' | 'custom';
  customValue?: string;
}

export interface MergeHistory {
  id: string;
  merge_request_id: string;
  action: 'created' | 'resolved_conflict' | 'merged' | 'closed';
  actor?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface BranchWithDetails extends TestSuiteBranch {
  latestSnapshot?: BranchSnapshot;
  testCode?: TestCode;
  commitCount?: number;
}

// Plugin System Types

export type PluginActionType =
  | 'navigate' | 'click' | 'fill' | 'assert' | 'screenshot' | 'wait' | 'hover' | 'select'
  | 'api-call' | 'custom-selector' | 'database-query' | 'file-upload'
  | 'drag-drop' | 'websocket' | 'local-storage' | 'cookie' | 'custom';

export interface PluginParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiline' | 'json';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[]; // For select type
  placeholder?: string;
  description?: string;
  validation?: {
    pattern?: string; // Regex pattern
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface PluginMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  author: string;
  version: string;
  category: 'interaction' | 'api' | 'data' | 'assertion' | 'utility' | 'custom';
  icon?: string; // Lucide icon name or emoji
  tags?: string[];
  documentation?: string; // URL or markdown
  createdAt: string;
  updatedAt: string;
}

export interface PluginAction {
  metadata: PluginMetadata;
  actionType: PluginActionType;
  parameters: PluginParameter[];
  codeGenerator: string; // Name of the code generator function
  uiComponent?: string; // Custom UI component name (optional)
  dependencies?: string[]; // NPM packages required
  examples?: PluginExample[];
}

export interface PluginExample {
  title: string;
  description: string;
  parameterValues: Record<string, unknown>;
  expectedCode: string;
}

export interface InstalledPlugin {
  id: string;
  plugin_id: string;
  plugin_action: PluginAction;
  enabled: boolean;
  install_source: 'marketplace' | 'local' | 'registry';
  installed_at: string;
  updated_at: string;
}

export interface PluginRegistry {
  id: string;
  name: string;
  description: string;
  url: string; // API endpoint for registry
  enabled: boolean;
  credentials?: Record<string, string>; // For authenticated registries
  created_at: string;
}

export interface PluginMarketplaceEntry {
  pluginAction: PluginAction;
  downloads: number;
  rating?: number;
  reviews?: number;
  verified: boolean;
  repository?: string;
  license?: string;
}

export interface PluginExecutionContext {
  page?: unknown; // Playwright page object
  testName: string;
  suiteId: string;
  viewport?: string;
  environment?: Record<string, string>;
}

// Test Run Queue Types

export interface QueuedTestRun {
  id: string;
  suite_id: string;
  config: ViewportConfig;
  priority: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled';
  retry_count: number;
  max_retries: number;
  run_id?: string;
  error_message?: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueMetadata {
  id: string;
  key: string;
  value: number | string | boolean | Record<string, unknown>;
  updated_at: string;
}

export interface QueueStats {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  retrying: number;
  total: number;
}
