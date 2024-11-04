import { assertEquals } from "./dev_deps.ts";
import { IPipelineResult } from "./pipeline.ts";

Deno.test("IPipelineResult type validation", () => {
  const successResult: IPipelineResult = {
    success: true,
    data: "test data",
  };

  const errorResult: IPipelineResult = {
    success: false,
    error: new Error("test error"),
  };

  assertEquals(successResult.success, true);
  assertEquals(errorResult.success, false);
});
