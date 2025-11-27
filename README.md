# Codex

A modern article reading and archival tool built with Deno, demonstrating AI-assisted development with systematic code refinement.

## Features

- **Medium article fetching** with authentication support
- **HTML to Markdown conversion** with sophisticated cleanup
- **Metadata extraction** (title, author, publish date, URL)
- **YAML frontmatter** for preserved article metadata
- **Clean architecture** with plugin-based reader design
- **Comprehensive test coverage** using Deno's native testing

## Getting Started

### Prerequisites

- Deno 1.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codex.git
cd codex

# Run the application
deno run --allow-net --allow-read --allow-write src/main.ts <article-url>
```

### Usage

```bash
# Fetch a Medium article
deno run --allow-net --allow-read --allow-write src/main.ts https://medium.com/@author/article-title

# With authentication (for paywalled content)
MEDIUM_COOKIE="your-session-cookie" deno run --allow-net --allow-read --allow-write --allow-env src/main.ts https://medium.com/@author/article-title
```

Articles are saved as Markdown files with YAML frontmatter containing metadata.

## Project Structure

```
codex/
├── src/
│   ├── types.ts              # Type definitions and interfaces
│   ├── errors.ts             # Error handling with Result types
│   ├── article_service.ts    # Service orchestration
│   ├── reader_medium.ts      # Medium.com article reader
│   ├── markdown.ts           # HTML to Markdown conversion
│   ├── storage.ts            # File system operations
│   ├── main.ts               # CLI entry point
│   └── *_test.ts             # Test files
├── docs/
│   ├── logs/                 # Development documentation
│   └── issues/               # Code review and issues
├── scripts/
│   └── verify_refactor.sh    # Refactoring verification
└── test_articles/            # Sample output
```

## Architecture

The project uses a **plugin-based reader architecture** allowing easy addition of new article sources:

```typescript
type ArticleReader = {
  canHandle: (source: string) => boolean;
  fetchArticle: (source: string, config: ReaderConfig) => Promise<FetchResult>;
};
```

Error handling uses **discriminated unions** (Result types) for type-safe error handling without exceptions.

## Development

### Running Tests

```bash
deno task test
```

### Verify Refactoring

```bash
./scripts/verify_refactor.sh --dry-run
```

## Roadmap

- [ ] arXiv article reader
- [ ] NYTimes article reader
- [ ] Caching system
- [ ] Configuration schema validation
- [ ] Structured logging

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Martin Fowler's refactoring patterns
- Deno community
- AI assistance in prototype development
