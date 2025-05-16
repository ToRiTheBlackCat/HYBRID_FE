export type Entry = {
  keyword: string;
  meaning: string;
}

export interface ConjunctionState {
  activityName: string;
  entries: Entry[];
}

export interface AnagramState {
  activityName: string;
  words: string[];
}
export type Words = {
  words: string[];
}

export type Answer = string;

export type Question = {
  text: string;
  answer: Answer[];
}