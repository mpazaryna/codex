import { assert, assertExists } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { fetchArticle } from "./article_reader.ts"; // Adjust the import path as necessary

Deno.test("Integration Test: fetchArticle", async () => {
  const url = "https://medium.com/macoclock/10-mac-apps-under-20-that-are-totally-worth-it-0da24b9e665c"; // Example URL
  const result = await fetchArticle(url);

  // Check if the fetch was successful
  assert(result.success, "The article fetch should be successful");

  // Check if the file was created
  assertExists(result.filePath, "The file path should exist");
  
  // Optionally, you can check if the file content is valid
  const fileContent = await Deno.readTextFile(result.filePath);
  assert(fileContent.includes("---"), "The file should contain a YAML header");
});

// Running the tests:
// deno test --allow-net --allow-read --allow-write --allow-env article_reader_test.ts