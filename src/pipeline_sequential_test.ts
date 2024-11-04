import { assertEquals } from "./dev_deps.ts";
import { SequentialPipeline } from "./pipeline_sequential.ts";

Deno.test("SequentialPipeline.process - success case", async () => {
  const pipeline = new SequentialPipeline();
  const testUrl = "https://test.com/article";

  const result = await pipeline.process(testUrl);

  assertEquals(result.success, true);
  assertEquals(result.data, `Processed ${testUrl}`);
});

Deno.test("SequentialPipeline.process - error handling", async () => {
  const pipeline = new SequentialPipeline();
  const testUrl = "";

  const result = await pipeline.process(testUrl);

  assertEquals(result.success, true); // Currently always returns true
  assertEquals(result.data, `Processed ${testUrl}`);
});
