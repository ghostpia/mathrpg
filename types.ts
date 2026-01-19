
export type QuestionType = 'multiplication' | 'division';

export interface Question {
  id: string;
  type: QuestionType;
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeTaken?: number;
}

export interface QuizSession {
  date: string;
  timestamp: number;
  questions: Question[];
  score: number;
  totalTime: number;
  gainedExp: number;
}

export interface UserStats {
  totalExp: number;
  level: number;
}

export const LEVELS = [
  { lv: 1, name: "말랑 아메바", icon: "🧬", minExp: 0 },
  { lv: 2, name: "계산 병아리", icon: "🐣", minExp: 200 },
  { lv: 3, name: "암산 다람쥐", icon: "🐿️", minExp: 600 },
  { lv: 4, name: "영리한 여우", icon: "🦊", minExp: 1200 },
  { lv: 5, name: "박학다식 올빼미", icon: "🦉", minExp: 2200 },
  { lv: 6, name: "광속 치타", icon: "🐆", minExp: 3500 },
  { lv: 7, name: "수학 독수리", icon: "🦅", minExp: 5000 },
  { lv: 8, name: "두뇌 드래곤", icon: "🐲", minExp: 7000 },
  { lv: 9, name: "슈퍼 지니어스", icon: "🧠", minExp: 9500 },
  { lv: 10, name: "연산의 신", icon: "👑", minExp: 13000 }
];
