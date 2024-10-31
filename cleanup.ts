/**
 * A utility for cleaning and standardizing markdown formatting.
 */

// Common regex patterns
const PATTERNS = {
    multipleNewlines: /\n{3,}/g,
    spaceBeforeHeading: /^(#+)([^\s])/gm,  // Changed to match start of line and use gm flags
    spaceAfterHeading: /^(#+\s.*[^\n])\n(?=[^\n])/gm,  // Changed to match start of line and use gm flags
    listItemSpacing: /^(-|\*|\d+\.)\s*/gm,
    trailingSpaces: /[ \t]+$/gm,
    emptyLinkBrackets: /\[\](\(.*?\))/g,
    inconsistentEmphasis: /_([^_]+)_/g,
    codeBlockFencing: /```([a-zA-Z]*)\n([\s\S]*?)```/g,
    tableAlignment: /\|([^|]*)\|/g,
    htmlComments: /<!--[\s\S]*?-->/g,
  } as const;
  
  interface CleanupOptions {
    removeMultipleNewlines?: boolean;
    fixHeadingSpacing?: boolean;
    fixListSpacing?: boolean;
    removeTrailingSpaces?: boolean;
    fixEmptyLinks?: boolean;
    standardizeEmphasis?: boolean;
    fixCodeBlocks?: boolean;
    fixTableFormatting?: boolean;
    preserveHtmlComments?: boolean;
  }
  
  export async function cleanupMarkdown(
    content: string,
    options: CleanupOptions = {},
  ): Promise<string> {
    const {
      removeMultipleNewlines = true,
      fixHeadingSpacing = true,
      fixListSpacing = true,
      removeTrailingSpaces = true,
      fixEmptyLinks = true,
      standardizeEmphasis = true,
      fixCodeBlocks = true,
      fixTableFormatting = true,
      preserveHtmlComments = true,
    } = options;
  
    let cleanContent = content;
  
    // Store HTML comments if preservation is enabled
    const htmlComments: string[] = [];
    if (preserveHtmlComments) {
      let match;
      let index = 0;
      while ((match = PATTERNS.htmlComments.exec(content)) !== null) {
        htmlComments.push(match[0]);
        cleanContent = cleanContent.replace(
          match[0],
          `<!--PRESERVE_COMMENT_${index}-->`
        );
        index++;
      }
    }
  
    // Remove multiple consecutive newlines
    if (removeMultipleNewlines) {
      cleanContent = cleanContent.replace(PATTERNS.multipleNewlines, "\n\n");
    }
  
    // Fix heading spacing
    if (fixHeadingSpacing) {
      // Ensure space after # at start of lines only
      cleanContent = cleanContent.replace(PATTERNS.spaceBeforeHeading, "$1 $2");
      // Ensure blank line after heading
      cleanContent = cleanContent.replace(PATTERNS.spaceAfterHeading, "$1\n\n");
    }
  
    // Fix list item spacing
    if (fixListSpacing) {
      cleanContent = cleanContent.replace(PATTERNS.listItemSpacing, (match) => {
        // Ensure exactly one space after list markers
        return match.trim() + " ";
      });
    }
  
    // Remove trailing spaces
    if (removeTrailingSpaces) {
      cleanContent = cleanContent.replace(PATTERNS.trailingSpaces, "");
    }
  
    // Fix empty link text
    if (fixEmptyLinks) {
      cleanContent = cleanContent.replace(
        PATTERNS.emptyLinkBrackets,
        "[Link]$1"
      );
    }
  
    // Standardize emphasis to asterisks
    if (standardizeEmphasis) {
      cleanContent = cleanContent.replace(PATTERNS.inconsistentEmphasis, "*$1*");
    }
  
    // Fix code block formatting
    if (fixCodeBlocks) {
      cleanContent = cleanContent.replace(
        PATTERNS.codeBlockFencing,
        (_, language, code) => {
          const trimmedCode = code.trim();
          return `\`\`\`${language.toLowerCase()}\n${trimmedCode}\n\`\`\``;
        }
      );
    }
  
    // Fix table formatting
    if (fixTableFormatting) {
      cleanContent = cleanContent.replace(
        PATTERNS.tableAlignment,
        (match, content) => {
          return `|${content.trim()}|`;
        }
      );
    }
  
    // Restore HTML comments if preservation was enabled
    if (preserveHtmlComments) {
      htmlComments.forEach((comment, index) => {
        cleanContent = cleanContent.replace(
          `<!--PRESERVE_COMMENT_${index}-->`,
          comment
        );
      });
    }
  
    return cleanContent.trim();
  }
  
  async function processFile(filePath: string, options: CleanupOptions = {}) {
    try {
      console.log(`Processing: ${filePath}`);
      const content = await Deno.readTextFile(filePath);
      const cleanedContent = await cleanupMarkdown(content, options);
      
      // Create backup of original file
      const backupPath = `${filePath}.backup`;
      await Deno.writeTextFile(backupPath, content);
      
      // Write cleaned content to original file
      await Deno.writeTextFile(filePath, cleanedContent);
      
      console.log(`✓ Cleaned and backed up: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  async function processDirectory(dirPath: string, options: CleanupOptions = {}) {
    try {
      for await (const entry of Deno.readDir(dirPath)) {
        const fullPath = `${dirPath}/${entry.name}`;
        
        if (entry.isDirectory) {
          await processDirectory(fullPath, options);
        } else if (entry.isFile && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
          await processFile(fullPath, options);
        }
      }
    } catch (error) {
      console.error(`Error processing directory ${dirPath}:`, error);
    }
  }
  
  // Example usage as CLI
  if (import.meta.main) {
    const path = Deno.args[0];
    if (!path) {
      console.error("Please provide a file or directory path");
      Deno.exit(1);
    }
  
    try {
      const stat = await Deno.stat(path);
      if (stat.isDirectory) {
        await processDirectory(path);
        console.log('✓ Directory processing complete');
      } else {
        await processFile(path);
        console.log('✓ File processing complete');
      }
    } catch (error) {
      console.error("Error:", error);
      Deno.exit(1);
    }
  }