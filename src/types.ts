// types.ts
export type ArticleMetadata = {
  title: string;
  author: string;
  source: string;
  publishDate: string;
  dateSaved: string;
};

export type FetchResult = {
  success: boolean;
  fileName?: string;
  metadata?: ArticleMetadata;
  filePath?: string;
  error?: string;
};

export type ReaderConfig = {
  outputDir: string;
  cookies: string;
};

export type ArticleReader = {
  canHandle: (source: string) => boolean;
  fetchArticle: (source: string, config: ReaderConfig) => Promise<FetchResult>;
};
