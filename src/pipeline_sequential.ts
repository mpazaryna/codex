import { IPipeline, IPipelineResult } from "./pipeline.ts";
import { fetchArticle } from "./article_reader.ts";

export class SequentialPipeline implements IPipeline {
  async process(url: string): Promise<IPipelineResult> {
    try {
      const result: { success: boolean; error?: unknown; filePath?: string } =
        await fetchArticle(url);

      if (!result.success) {
        console.error("Error fetching article:", result.error);
        return {
          success: false,
          error:
            result.error instanceof Error
              ? result.error
              : new Error(String(result.error)),
        };
      }

      console.log(`Article written to ${result.filePath} successfully.`);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error("Error in pipeline processing:", error.message);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
