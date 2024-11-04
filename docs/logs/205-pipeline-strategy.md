# 01 - Pipeline Architecture Design

## Context and Background

The project currently has a working article reader implementation (`article_reader.ts`) that fetches and processes Medium articles, converting them to markdown with proper metadata. The module is well-tested with integration tests. We want to create a pipeline architecture that can support different processing patterns while maintaining the existing core functionality.

## Discussion and Evolution

### Current State

- Working `article_reader.ts` module with core functionality
- Integration tests validating the fetching and processing
- Direct URL-based execution model
- Environment-based configuration
- Basic error handling

### Requirements for Pipeline Architecture

1. Support multiple pipeline patterns for different use cases
2. Maintain existing core functionality
3. Keep current tests working
4. Allow for gradual refactoring of core modules
5. Support future expansion (new article sources, processors)
6. Provide clear entry point for pipeline selection and execution

### Explored Pipeline Patterns

1. **Sequential Pipeline**

   - Linear processing: URL → Validate → Fetch → Process → Save
   - Best for: Single article processing, simple workflows
   - Benefits: Simple to implement, debug, and test
   - Limitations: Limited parallelization

2. **Event-Based Pipeline**

   - Decoupled processing through event emission
   - Best for: Multiple articles, async workflows
   - Benefits: Flexible, easily extensible
   - Limitations: Complex event ordering, harder to debug

3. **Stream-Based Pipeline**

   - Streaming data processing with transforms
   - Best for: Large batches, continuous processing
   - Benefits: Memory efficient, natural backpressure
   - Limitations: More complex implementation

4. **Actor-Based Pipeline**
   - Isolated components with message passing
   - Best for: Distributed processing, complex workflows
   - Benefits: Good scaling, isolation
   - Limitations: Complex state management

## Decisions

### Architecture Decisions

1. Use a flat directory structure following Deno best practices
2. Create a common pipeline interface that all implementations will follow
3. Keep core functionality independent of pipeline implementation
4. Use Strategy Pattern to make pipeline implementations interchangeable
5. Maintain existing test coverage while adding pipeline-specific tests
6. Separate CLI entry point (`main.ts`) from library exports (`mod.ts`)

### Project Structure

```shell
# Entry Points
main.ts                      # CLI entry point and pipeline orchestration
main_test.ts                # Tests for CLI functionality
mod.ts                      # Library exports for external usage
mod_test.ts                # Integration tests for library API

# Core Implementation
article_reader.ts           # Article fetching/processing logic
article_reader_test.ts      # Tests for article reader
pipeline.ts                # Pipeline interface and shared types
pipeline_test.ts          # Tests for pipeline interface
pipeline_sequential.ts    # Sequential pipeline implementation
pipeline_sequential_test.ts
pipeline_event.ts        # Event-based pipeline implementation
pipeline_event_test.ts
pipeline_stream.ts      # Stream-based pipeline implementation
pipeline_stream_test.ts
pipeline_actor.ts      # Actor-based pipeline implementation
pipeline_actor_test.ts

# Supporting Files
config.ts              # Configuration management (future)
config_test.ts       # Tests for configuration
errors.ts           # Error types and handling (future)
errors_test.ts     # Tests for error handling
deps.ts            # External dependencies
dev_deps.ts       # Development dependencies
README.md         # Project documentation
```

### Entry Point Design (`main.ts`)

```typescript
// Example structure of main.ts
interface CliOptions {
  pipeline: "sequential" | "event" | "stream" | "actor";
  url: string | string[];
  config?: string;
  output?: string;
}

// CLI argument parsing
const cliOptions: CliOptions = parseCLIArgs(Deno.args);

// Pipeline factory
function createPipeline(type: CliOptions["pipeline"]): Pipeline {
  switch (type) {
    case "sequential":
      return new SequentialPipeline();
    case "event":
      return new EventPipeline();
    case "stream":
      return new StreamPipeline();
    case "actor":
      return new ActorPipeline();
    default:
      return new SequentialPipeline();
  }
}

// Usage examples:
// deno run --allow-net main.ts --pipeline=sequential --url=https://...
// deno run --allow-net main.ts --pipeline=event --url=urls.txt
```

### Library Export Design (`mod.ts`)

```typescript
// Public API exports
export { fetchArticle } from "./article_reader.ts";
export { Pipeline } from "./pipeline.ts";
export { SequentialPipeline } from "./pipeline_sequential.ts";
export { EventPipeline } from "./pipeline_event.ts";
export { StreamPipeline } from "./pipeline_stream.ts";
export { ActorPipeline } from "./pipeline_actor.ts";
```

## Next Steps

1. Implementation Phase 1:

   - Create basic `main.ts` with pipeline selection
   - Create `pipeline.ts` with interface and types
   - Implement `pipeline_sequential.ts`
   - Add pipeline tests

2. Implementation Phase 2:

   - Enhance `main.ts` with configuration options
   - Create `errors.ts` for better error handling
   - Implement `pipeline_event.ts`
   - Add pipeline-specific tests

3. Implementation Phase 3:

   - Add batch processing to `main.ts`
   - Implement `pipeline_stream.ts`
   - Add performance tests
   - Add pipeline selection logic

4. Implementation Phase 4:
   - Add distributed processing options to `main.ts`
   - Implement `pipeline_actor.ts`
   - Add monitoring and logging

### CLI Usage Examples

```bash
# Sequential pipeline with single URL
deno run --allow-net main.ts --pipeline=sequential --url="https://medium.com/article"

# Event pipeline with multiple URLs
deno run --allow-net main.ts --pipeline=event --url="urls.txt"

# Stream pipeline with configuration
deno run --allow-net main.ts --pipeline=stream --url="urls.txt" --config="config.json"

# Actor pipeline with custom output
deno run --allow-net main.ts --pipeline=actor --url="urls.txt" --output="custom"
```

## Open Questions

1. Should pipeline selection be automatic based on input type/size?
2. How should pipeline-specific configuration be handled in the CLI?
3. What monitoring/metrics should be collected?
4. How should pipeline failures be handled at different stages?
5. Should we support pipeline chaining through the CLI?
6. How should we handle different output formats/destinations?

This design provides a clear separation between the CLI tool (`main.ts`) and the library API (`mod.ts`), while maintaining a simple, flat structure that follows Deno best practices. The entry point provides flexibility in pipeline selection and configuration while keeping the core functionality modular and reusable.
