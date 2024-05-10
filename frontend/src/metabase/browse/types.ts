import type {
  RecentCollectionItem,
  SearchModel,
  SearchResult,
  SearchResultId,
} from "metabase-types/api";

/** SearchResult with most properties optional */
export type WeakSearchResult<
  Id extends SearchResultId = SearchResultId,
  Model extends SearchModel = SearchModel,
> = Partial<SearchResult<Id, Model>> &
  Pick<SearchResult<Id, Model>, "id" | "name" | "model">;

/** Model retrieved through the search endpoint */
export type ModelResult = WeakSearchResult<number, "dataset">;

/** A recently viewed model */
export type RecentModel = Omit<RecentCollectionItem, "model"> & {
  model: "dataset";
};
