import markdownlint from "npm:markdownlint";
import { parse } from "https://deno.land/std@0.208.0/path/mod.ts";

async function lintMarkdownFiles(directory: string) {
  const markdownFiles: string[] = [];

  // Recursively find all markdown files
  for await (const entry of Deno.readDir(directory)) {
    if (
      entry.isFile &&
      (entry.name.endsWith(".md") || entry.name.endsWith(".markdown"))
    ) {
      markdownFiles.push(`${directory}/${entry.name}`);
    } else if (entry.isDirectory) {
      markdownFiles.push(
        ...(await lintMarkdownFiles(`${directory}/${entry.name}`))
      );
    }
  }

  // Configuration for markdownlint
  const options = {
    files: markdownFiles,
    config: {
      default: true,
      MD013: false, // Disable line length checking
      MD033: false, // Allow inline HTML
    },
  };

  // Lint files
  markdownlint(options, function callback(err, result) {
    if (err) {
      console.error("Error:", err);
      return;
    }

    const resultString = result.toString();
    if (resultString) {
      console.log("\nLinting issues found:");
      console.log(resultString);
    } else {
      console.log("✓ All markdown files are valid");
    }
  });

  return markdownFiles;
}

// Run the linter from command line
if (import.meta.main) {
  const directory = Deno.args[0] || ".";
  console.log(`Linting markdown files in ${directory}...`);
  await lintMarkdownFiles(directory);
}

// running the script:
// deno run --allow-read lint.ts ./docs
