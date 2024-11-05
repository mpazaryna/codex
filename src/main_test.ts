// main_test.ts
import {
  assert,
  assertExists,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { createArticleService } from "./article_service.ts";
import { ensureOutputDir, listArticles, deleteArticle } from "./storage.ts";

Deno.test({
  name: "Integration Test: Full article fetching flow",
  fn: async () => {
    // Setup test configuration
    const config = {
      outputDir: "./test_articles",
      cookies: Deno.env.get("MEDIUM_COOKIE") ?? "",
    };

    // Ensure we have cookies for the test
    if (!config.cookies) {
      throw new Error(
        "MEDIUM_COOKIE environment variable must be set to run this test"
      );
    }

    // Ensure test directory exists and is empty
    await ensureOutputDir(config.outputDir);

    const articleService = createArticleService(config);
    // Using a more reliable test article
    const testUrl =
      "https://medium.com/@martinkaptein/building-with-deno-417c41d24361";

    try {
      // Execute
      console.log("Fetching article from:", testUrl);
      const result = await articleService.fetchArticle(testUrl);

      // Log the full result for debugging
      console.log("Fetch result:", {
        success: result.success,
        error: result.error,
        fileName: result.fileName,
        metadata: result.metadata,
      });

      // Verify
      assert(result.success, `Article fetch failed: ${result.error}`);
      assertExists(result.fileName, "Should have a filename");
      assertExists(result.filePath, "Should have a file path");
      assertExists(result.metadata, "Should have metadata");

      // Verify file was created and has content
      const fileContent = await Deno.readTextFile(result.filePath);
      assert(fileContent.length > 0, "File should have content");

      // Log content length for debugging
      console.log("File content length:", fileContent.length);
      console.log("First 500 characters:", fileContent.slice(0, 500));

      assert(fileContent.includes("---"), "Should have frontmatter");
      assert(
        fileContent.includes("title:"),
        "Should have title in frontmatter"
      );
      assert(
        fileContent.includes("author:"),
        "Should have author in frontmatter"
      );
      assert(
        !fileContent.includes("Open in app"),
        "Should not contain 'Open in app' text"
      );

      // Verify metadata
      const metadata = result.metadata;
      assert(metadata?.title.length > 0, "Should have a title");
      assert(metadata?.author.length > 0, "Should have an author");
      assert(
        metadata?.author !== "Open in app",
        "Author should not be 'Open in app'"
      );
      assert(metadata?.source === testUrl, "Should have correct source URL");
      assert(metadata?.publishDate.length > 0, "Should have a publish date");
      assert(metadata?.dateSaved.length > 0, "Should have a saved date");

      console.log("Test succeeded with metadata:", metadata);
    } finally {
      // Cleanup: Remove test directory and its contents
      try {
        const files = await listArticles(config.outputDir);
        for (const file of files) {
          await deleteArticle(`${config.outputDir}/${file}`);
        }
        await Deno.remove(config.outputDir).catch(() => {});
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
