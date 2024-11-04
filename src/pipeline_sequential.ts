import { IPipeline, IPipelineResult } from "./pipeline.ts";

export class SequentialPipeline implements IPipeline {
  async process(url: string): Promise<IPipelineResult> {
    try {
      // For now, just return a success result
      // We'll integrate with article_reader.ts in the next step
      return {
        success: true,
        data: `Processed ${url}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
