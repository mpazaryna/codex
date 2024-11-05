// article_service.ts
import { ArticleReader, FetchResult, ReaderConfig } from "./types.ts";
import { createMediumReader } from "./reader_medium.ts";

export const createArticleService = (config: ReaderConfig) => {
  const readers: ArticleReader[] = [
    createMediumReader(),
    // Add more readers here as they're implemented
    // createArxivReader(),
    // createNytimesReader(),
  ];

  return {
    fetchArticle: async (source: string): Promise<FetchResult> => {
      const reader = readers.find((r) => r.canHandle(source));

      if (!reader) {
        return {
          success: false,
          error: "No compatible reader found for the given source",
        };
      }

      return reader.fetchArticle(source, config);
    },
  };
};
