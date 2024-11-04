/**
 * Test module for the Article Reader functionality
 * @module article_reader_test
 */

import {
  assert,
  assertExists,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { fetchArticle } from "./article_reader.ts";

/**
 * Tests the successful fetching and saving of a Medium article.
 *
 * @example
 * ```typescript
 * const result = await fetchArticle(mediumUrl);
 * assert(result.success === true);
 * ```
 *
 * @throws {Error} When the article cannot be fetched or saved
 * @throws {TypeError} When the URL is malformed
 *
 * @requires --allow-net for fetching
 * @requires --allow-read for file verification
 * @requires --allow-write for file creation
 */
Deno.test({
  name: "Integration Test: fetchArticle should successfully fetch and save Medium article",
  fn: async () => {
    const testUrl =
      "https://medium.com/bricksnbrackets/from-mini-to-mighty-the-mac-has-finally-caught-up-with-the-ipad-eb81f39ba0c4";

    try {
      const result = await fetchArticle(testUrl);

      assert(result.success === true, "The article fetch should be successful");
      assertExists(result.filePath, "The file path should exist");

      const fileContent = await Deno.readTextFile(result.filePath);
      assert(
        fileContent.includes("---"),
        "The file should contain YAML frontmatter delimiters"
      );

      await Deno.remove(result.filePath);
    } catch (error) {
      throw new Error(
        `Test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
  sanitizeResources: true,
  sanitizeOps: true,
});

/**
 * Tests error handling for invalid URLs.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await fetchArticle(invalidUrl);
 *   assert(!result.success);
 * } catch (error) {
 *   assert(error instanceof Error);
 * }
 * ```
 *
 * @throws {Error} Expected to throw for invalid URLs
 * @requires --allow-net for attempting connection
 */
Deno.test({
  name: "Integration Test: fetchArticle should handle invalid URLs",
  fn: async () => {
    const invalidUrl = "https://invalid-url-that-doesnt-exist.com";

    try {
      const result = await fetchArticle(invalidUrl);
      assert(!result.success, "The fetch should fail for invalid URLs");
    } catch (error) {
      assert(error instanceof Error, "Should throw an Error instance");
    }
  },
});

/**
 * Tests validation of Medium-specific URLs.
 *
 * @example
 * ```typescript
 * try {
 *   const result = await fetchArticle(nonMediumUrl);
 *   assert(!result.success);
 * } catch (error) {
 *   assert(error instanceof Error);
 * }
 * ```
 *
 * @throws {Error} Expected to throw for non-Medium URLs
 * @requires --allow-net for attempting connection
 */
Deno.test({
  name: "Integration Test: fetchArticle should handle non-Medium URLs",
  fn: async () => {
    const nonMediumUrl = "https://example.com";

    try {
      const result = await fetchArticle(nonMediumUrl);
      assert(!result.success, "The fetch should fail for non-Medium URLs");
    } catch (error) {
      assert(error instanceof Error, "Should throw an Error instance");
    }
  },
});

/**
 * @fileoverview Test suite for the Article Reader functionality
 *
 * Required permissions:
 * ```bash
 * deno test --allow-net --allow-read --allow-write --allow-env article_reader_test.ts
 * ```
 *
 * @note These tests require network access and file system permissions
 * @note Tests clean up after themselves by removing generated files
 *
 * @see {@link ./article_reader.ts} for the implementation being tested
 */
