
import { Question, QuestionType, QuizSession, UserStats, LEVELS } from './types.ts';

// Add missing formatDate export used in HistoryView.tsx
export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const generateQuestion = (id: string): Question => {
  const type: QuestionType = Math.random() > 0.5 ? 'multiplication' : 'division';
  let num1, num2, answer;

  if (type === 'multiplication') {
    num1 = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    answer = num1 * num2;
  } else {
    const quotient = Math.floor(Math.random() * 90) + 10;
    num2 = Math.floor(Math.random() * 8) + 2;
    num1 = quotient * num2;
    answer = quotient;
  }

  return { id, type, num1, num2, answer };
};

export const calculateExp = (correctCount: number, totalTime: number): number => {
  let exp = correctCount * 20; // 문제당 20
  if (correctCount === 5) exp += 50; // 만점 보너스
  
  // 스피드 보너스
  if (totalTime < 15) exp += 70;
  else if (totalTime < 25) exp += 40;
  else if (totalTime < 40) exp += 20;

  return exp;
};

export const getUserStats = (): UserStats => {
  const data = localStorage.getItem('math_quiz_user_stats');
  if (!data) return { totalExp: 0, level: 1 };
  const stats = JSON.parse(data);
  
  // 현재 경험치로 레벨 재계산
  let level = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (stats.totalExp >= LEVELS[i].minExp) {
      level = LEVELS[i].lv;
      break;
    }
  }
  return { ...stats, level };
};

export const addExp = (amount: number) => {
  const stats = getUserStats();
  const newExp = stats.totalExp + amount;
  localStorage.setItem('math_quiz_user_stats', JSON.stringify({ totalExp: newExp }));
};

export const saveQuizSession = (session: QuizSession) => {
  try {
    const existing = localStorage.getItem('math_quiz_history');
    const history: QuizSession[] = existing ? JSON.parse(existing) : [];
    localStorage.setItem('math_quiz_history', JSON.stringify([...history, session].slice(-50)));
    addExp(session.gainedExp);
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const getHistory = (): QuizSession[] => {
  try {
    const existing = localStorage.getItem('math_quiz_history');
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
};
