/**
 * Represents the result of a pipeline operation
 */
export interface IPipelineResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}

/**
 * Core pipeline interface that all pipeline implementations must follow
 */
export interface IPipeline {
  /**
   * Processes a single URL through the pipeline
   * @param url The URL to process
   * @returns A promise resolving to the pipeline result
   */
  process(url: string): Promise<IPipelineResult>;
}
