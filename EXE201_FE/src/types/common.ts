export type ConjunctionEntry = {
  Term: string;
  Definition: string;
}


export type Words = {
  words: string[];
}

export type Answer = string;

export type Question = {
  text: string;
  answer: Answer[];
  correctIndexes: number[];
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
  Duration: number,
  TemplateId: string,
  CourseId: string,
  GameData: ConjunctionEntry[];
}
export type Anagram = {
  MinigameName: string;
  ImageFile: File | null;
  GameDataJson: string; 
  TeacherId: string;
  Duration: number;
  TemplateId: string;
  CourseId: string;
}
export type MinigameData = {
  MinigameName: string;
  ImageFile: File | null;
  GameDataJson: string; 
  TeacherId: string;
  Duration: number;
  TemplateId: string;
  CourseId: string;
}
export type UpdateConjunctionData = {
  MinigameId: string;
  MinigameName: string;
  ImageFile?: File;
  ImageUrl?: string;
  Duration: number;
  TemplateId: string;
  TeacherId: string;
  GameData: ConjunctionEntry[];
}
export type UpdateAnagramData = {
  MinigameId: string;
  MinigameName: string;
  ImageFile?: File;
  Duration: number;
  TemplateId: string;
  TeacherId: string;
  GameData: Words[]};
export type FetchTeacherMinigamesParams = {
  teacherId: string;
  minigameName?: string;
  templateId?: string;
  pageNum?: number;
  pageSize?: number;
}