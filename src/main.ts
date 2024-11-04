import { IPipelineResult } from "./pipeline.ts";
import { SequentialPipeline } from "./pipeline_sequential.ts";

interface CliOptions {
  url: string;
}

async function main() {
  try {
    const options: CliOptions = {
      url: "https://medium.com/gitconnected/claude-3-5-the-king-of-document-intelligence-f57bea1d209d",
    };
    const pipeline = new SequentialPipeline();

    const result: IPipelineResult = await pipeline.process(options.url);

    if (!result.success) {
      console.error("Pipeline failed:", result.error?.message);
      Deno.exit(1);
    }

    console.log("Pipeline completed successfully");
  } catch (error) {
    console.error("Error:", error.message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}

// run with:
// deno run --allow-net --allow-read --allow-write src/main.ts
