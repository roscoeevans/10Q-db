// Core prompt management types

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  content: string;
  variables: PromptVariable[];
  constraints: PromptConstraint[];
  metadata: PromptMetadata;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: ValidationRule[];
}

export interface PromptConstraint {
  type: 'token_limit' | 'format' | 'content' | 'safety';
  value: any;
  description: string;
}

export interface PromptMetadata {
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ValidationRule {
  type: 'min_length' | 'max_length' | 'regex' | 'custom';
  value: any;
  message: string;
}

// Prompt configuration types
export interface PromptConfig {
  version: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  retryAttempts: number;
  fallbackStrategies: FallbackStrategy[];
  modelConfig: ModelConfig;
}

export interface ModelConfig {
  primary: string;
  fallback: string;
  maxOutputTokens: number;
  safetySettings: SafetySettings;
}

export interface SafetySettings {
  harassment: SafetyLevel;
  hateSpeech: SafetyLevel;
  sexuallyExplicit: SafetyLevel;
  dangerousContent: SafetyLevel;
}

export type SafetyLevel = 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_HIGH_AND_ABOVE';

export type FallbackStrategy = 'simplified' | 'minimal' | 'legacy';

// A/B Testing types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: PromptVariant[];
  metrics: TestMetrics;
  startDate: Date;
  endDate: Date;
  status: TestStatus;
  trafficSplit: TrafficSplit;
}

export interface PromptVariant {
  id: string;
  name: string;
  promptTemplate: PromptTemplate;
  weight: number; // Percentage of traffic (0-100)
}

export interface TestMetrics {
  successRate: number;
  approvalRate: number;
  regenerationRate: number;
  tokenEfficiency: number;
  responseTime: number;
  userSatisfaction: number;
}

export type TestStatus = 'active' | 'completed' | 'paused' | 'draft';

export interface TrafficSplit {
  type: 'percentage' | 'round_robin' | 'weighted';
  distribution: Record<string, number>;
}

// Analytics types
export interface PromptAnalytics {
  promptId: string;
  version: string;
  timestamp: Date;
  metrics: PromptMetrics;
  errors: PromptError[];
  performance: PerformanceMetrics;
}

export interface PromptMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  averageTokenUsage: number;
  userApprovalRate: number;
  regenerationRate: number;
}

export interface PromptError {
  type: 'token_limit' | 'format_violation' | 'api_error' | 'content_filter' | 'validation_error';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
}

export interface PerformanceMetrics {
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  fallbackUsage: number;
}

// Question generation specific types
export interface QuestionGenerationContext {
  topic: string;
  count: number;
  difficulty: number;
  style: 'jeopardy' | 'standard' | 'custom';
  constraints: QuestionConstraints;
}

export interface QuestionConstraints {
  maxQuestionLength: number;
  minChoices: number;
  maxChoices: number;
  requiredTags: string[];
  forbiddenTopics: string[];
  difficultyRange: [number, number];
}

export interface QuestionRegenerationContext {
  originalQuestion: string;
  feedback: string;
  questionIndex: number;
  existingQuestions: string[];
  targetDifficulty: number;
  topic: string;
}

// Prompt builder types
export interface PromptBuilderConfig {
  template: PromptTemplate;
  variables: Record<string, any>;
  context?: Record<string, any>;
  options?: PromptBuilderOptions;
}

export interface PromptBuilderOptions {
  includeExamples: boolean;
  includeConstraints: boolean;
  optimizeForTokens: boolean;
  validateOutput: boolean;
}

export interface BuiltPrompt {
  content: string;
  tokenCount: number;
  variables: Record<string, any>;
  metadata: BuiltPromptMetadata;
}

export interface BuiltPromptMetadata {
  templateId: string;
  templateVersion: string;
  buildTimestamp: Date;
  validationPassed: boolean;
  warnings: string[];
}

// Version control types
export interface PromptVersion {
  id: string;
  templateId: string;
  version: string;
  changes: VersionChange[];
  author: string;
  timestamp: Date;
  description: string;
  isActive: boolean;
}

export interface VersionChange {
  type: 'added' | 'modified' | 'removed';
  field: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

// Export all types
export type {
  PromptTemplate,
  PromptVariable,
  PromptConstraint,
  PromptMetadata,
  ValidationRule,
  PromptConfig,
  ModelConfig,
  SafetySettings,
  SafetyLevel,
  FallbackStrategy,
  ABTest,
  PromptVariant,
  TestMetrics,
  TestStatus,
  TrafficSplit,
  PromptAnalytics,
  PromptMetrics,
  PromptError,
  PerformanceMetrics,
  QuestionGenerationContext,
  QuestionConstraints,
  QuestionRegenerationContext,
  PromptBuilderConfig,
  PromptBuilderOptions,
  BuiltPrompt,
  BuiltPromptMetadata,
  PromptVersion,
  VersionChange
}; 