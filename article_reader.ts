// article_reader.ts
import { DOMParser, Element, Node } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

// Configuration
const config = {
  outputDir: "./articles",
  cookies: Deno.env.get("MEDIUM_COOKIE") ?? "",
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  }
};

// Validate required environment variables
if (!config.cookies) {
  console.error("Error: MEDIUM_COOKIE environment variable is not set");
  console.error("Please set it using: export MEDIUM_COOKIE='your-cookie-value'");
  Deno.exit(1);
}

// Types
interface ArticleMetadata {
  title: string;
  author: string;
  source: string;
  publishDate: string;
  dateSaved: string;
}

interface FetchResult {
  success: boolean;
  fileName?: string;
  metadata?: ArticleMetadata;
  filePath?: string;
  error?: string;
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeWhitespace(text: string): string {
  return text
    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Normalize multiple consecutive whitespace characters
    .replace(/[ \t]+/g, ' ')
    // Remove leading/trailing whitespace from the entire text
    .trim();
}

function convertHtmlToMarkdown(html: string): string {
  // First, normalize the HTML whitespace
  let markdown = html.replace(/>\s+</g, '><');

  // Remove unnecessary divs and spans that might add extra spacing
  markdown = markdown
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '');

  // Handle headings
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level, content) => {
    return `\n\n${'#'.repeat(parseInt(level))} ${normalizeWhitespace(content)}\n\n`;
  });

  // Handle paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => {
    return `\n\n${normalizeWhitespace(content)}\n\n`;
  });

  // Handle lists
  markdown = markdown
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (_, content) => `\n${content}\n`)
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (_, content) => `\n${content}\n`)
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (_, content) => `- ${normalizeWhitespace(content)}\n`);

  // Handle formatting
  markdown = markdown
    .replace(/<(b|strong)[^>]*>(.*?)<\/\1>/gi, (_, __, content) => `**${content}**`)
    .replace(/<(i|em)[^>]*>(.*?)<\/\1>/gi, (_, __, content) => `*${content}*`);

  // Handle links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, 
    (_, url, text) => `[${normalizeWhitespace(text)}](${url})`);

  // Handle images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi,
    (_, src, alt) => `\n\n![${alt}](${src})\n\n`);

  // Handle line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  markdown = markdown
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Apply Medium-specific cleanup
  markdown = cleanupMarkdown(markdown);

  // Final whitespace normalization
  return markdown
    // Replace multiple consecutive blank lines with double newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove any leading/trailing whitespace
    .trim();
}

function cleanupMarkdown(content: string): string {
  let cleaned = content;

  // Remove Medium-specific elements
  const patterns = [
    // Remove source attribution
    /Source\s*:\s*[^\n]+/g,
    // Remove sharing elements
    /Share\s+More/g,
    /Listen\s+Share/g,
    // Remove Medium's source links
    /\[[\s\S]*?\]\(https?:\/\/[^\)]+source=post_page[^\)]*\)/g,
    // Remove empty links
    /\[\s*\]\([^\)]+\)/g,
    // Remove Medium's user references
    /\[@[^\]]+\]/g,
    // Remove "Published in" sections
    /Published in[\s\S]*?·/g,
    // Remove app-related text
    /Open in app/g,
    /Member-only story/g,
    // Remove timestamps
    /\d+ min read/g,
  ];

  // Apply each cleanup pattern
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Handle emoji titles with proper spacing
  cleaned = cleaned.replace(/([^\s])([🚀🤖🧠💻📱📰🌱🖍️📔🖌])/g, '$1 $2');
  cleaned = cleaned.replace(/([🚀🤖🧠💻📱📰🌱🖍️📔🖌])([^\s])/g, '$1 $2');

  // Normalize whitespace
  cleaned = cleaned
    // Replace multiple spaces with a single space
    .replace(/ +/g, ' ')
    // Normalize newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove leading/trailing whitespace from the entire text
    .trim();

  return cleaned;
}

async function ensureOutputDir(): Promise<void> {
  try {
    await Deno.mkdir(config.outputDir, { recursive: true });
  } catch (error) {
    console.error("Error creating output directory:", error);
    throw error;
  }
}

export async function fetchArticle(url: string): Promise<FetchResult> {
  try {
    console.log("Fetching article from:", url);
    
    const headers = {
      ...config.headers,
      "Cookie": config.cookies
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }
    
    // Clean up the DOM
    const elementsToRemove = [
      "script", 
      "noscript", 
      "style",
      ".metabar", 
      ".postMetaInline", 
      ".js-postShareWidget",
      ".progressiveMedia",
      ".graf-spacer",
      'pre[data-selectable-paragraph]',
      'span[data-selectable-paragraph]'
    ];
    
    elementsToRemove.forEach(selector => {
      doc.querySelectorAll(selector).forEach((node) => {
        if (node instanceof Element) {
          node._remove();
        }
      });
    });
    
    // Extract metadata
    const title = doc.querySelector("h1")?.textContent?.trim() || "Untitled";
    const author = doc.querySelector('a[rel="noopener follow"]')?.textContent?.trim() || "Unknown";
    const publishDate = doc.querySelector("time")?.getAttribute("datetime") || new Date().toISOString();
    
    console.log("\nExtracted metadata:");
    console.log("Title:", title);
    console.log("Author:", author);
    console.log("Publish Date:", publishDate);
    
    // Extract main content
    const articleElement = doc.querySelector("article") || doc.querySelector(".section-content");
    
    if (!articleElement) {
      throw new Error("Could not extract article content");
    }

    const articleContent = articleElement.innerHTML;
    const markdown = convertHtmlToMarkdown(articleContent);
    
    const metadata: ArticleMetadata = {
      title,
      author,
      source: url,
      publishDate,
      dateSaved: new Date().toISOString()
    };

    const yamlHeader = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const fileContent = `---\n${yamlHeader}\n---\n\n${markdown}`;

    await ensureOutputDir();
    const fileName = `${sanitizeFilename(title)}.md`;
    const filePath = `${config.outputDir}/${fileName}`;
    await Deno.writeTextFile(filePath, fileContent);

    return {
      success: true,
      fileName,
      metadata,
      filePath
    };
  } catch (error) {
    console.error("Error fetching article:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
if (import.meta.main) {
  const url = Deno.args[0] || "https://medium.com/macoclock/10-mac-apps-under-20-that-are-totally-worth-it-0da24b9e665c";
  
  console.log("Starting article fetch...");
  const result = await fetchArticle(url);
  
  if (result.success) {
    console.log("\nArticle saved successfully!");
    console.log("File:", result.filePath);
    console.log("Metadata:", result.metadata);
  } else {
    console.error("\nFailed to fetch article:", result.error);
    Deno.exit(1);
  }
}

// running the script:
// deno run --allow-net --allow-write --allow-read --allow-env article_reader.ts <url>