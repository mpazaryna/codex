import { assertEquals } from "jsr:@std/assert";
import { createArticleService } from "./article_service.ts";
import { ReaderConfig } from "./types.ts";

Deno.test(
  "fetchArticle should return error if no compatible reader is found",
  async () => {
    const config: ReaderConfig = { cookies: "", outputDir: "./test_output" };
    const articleService = createArticleService(config);

    const result = await articleService.fetchArticle(
      "https://example.com/some-article"
    );

    assertEquals(result.success, false);
    assertEquals(
      result.error,
      "No compatible reader found for the given source"
    );
  }
);
