export type SearchCategoryId = "all" | "cli-tools" | "software";

export interface SearchCategory {
  id: SearchCategoryId;
  label: string;
  icon: string;
}

export interface SearchResult {
  id: string;
  type: "cli-tool" | "software";
  name: string;
  description?: string;
  category?: string;
  data: any; // CLI tool or software data
}

export interface SearchState {
  query: string;
  category: SearchCategoryId;
  isFocused: boolean;
}


