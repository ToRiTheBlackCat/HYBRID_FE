export type ConjunctionEntry = {
  keyword: string;
  meaning: string;
}

export interface ConjunctionState {
  activityName: string;
  entries: ConjunctionEntry[];
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

export type RandomCardItem = {
  keyword: string;
  imageURL: string;
}

export type SpellingItem = {
  question?: string;
  answer?: string;
}

export type ResetPasswordData = {
  email: string;
  resetCode: string;
  password: string;
}
export type Course = {
  courseId: string;
  courseName: string;
  levelId: string;
  levelName: string;
  dataText?: string;
  thumbnail?: string;
  images?: string[];
}
export type Minigame = {
  minigameId: string;
  minigameName: string;
  teacherId: string;
  teacherName: string;
  thumbnailImage: string;
  duration: number;
  participantsCount: number | null;
  ratingScore: number | null;
  templateId: string;
  templateName: string;
  courseId: string;
};
export type Conjunction = {
  MinigameName: string,
  ImageFile: File | null,
  TeacherId: string,
  GameDataJson: string,
  Duration: number,
  TemplateId: string,
  CourseId: string,
  // GameData: ConjunctionEntry[];
}