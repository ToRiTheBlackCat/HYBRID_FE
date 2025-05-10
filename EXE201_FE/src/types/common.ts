export interface Entry {
  keyword: string;
  meaning: string;
}

export interface ConjunctionState {
  activityName: string;
  entries: Entry[];
}