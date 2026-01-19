
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Constants ---
type QuestionType = 'multiplication' | 'division';

interface Question {
  id: string;
  type: QuestionType;
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeTaken?: number;
}

interface QuizSession {
  date: string;
  timestamp: number;
  questions: Question[];
  score: number;
  totalTime: number;
  gainedExp: number;
}

interface UserStats {
  totalExp: number;
  level: number;
}

const LEVELS = [
  { lv: 1, name: "말랑 아메바", icon: "🧬", minExp: 0 },
  { lv: 2, name: "계산 병아리", icon: "🐣", minExp: 200 },
  { lv: 3, name: "암산 다람쥐", icon: "🐿️", minExp: 600 },
  { lv: 4, name: "영리한 여우", icon: "🦊", minExp: 1200 },
  { lv: 5, name: "박학다식 올빼미", icon: "🦉", minExp: 2200 },
  { lv: 6, name: "광속 치타", icon: "🐆", minExp: 3500 },
  { lv: 7, name: "수학 독수리", icon: "🦅", minExp: 5000 },
  { lv: 8, name: "두뇌 드래곤", icon: "🐲", minExp: 7500 },
  { lv: 9, name: "슈퍼 지니어스", icon: "🧠", minExp: 10000 },
  { lv: 10, name: "연산의 신", icon: "👑", minExp: 13500 }
];

// --- Utils ---
const generateQuestion = (id: string): Question => {
  const type: QuestionType = Math.random() > 0.5 ? 'multiplication' : 'division';
  let num1: number, num2: number, answer: number;
  if (type === 'multiplication') {
    num1 = Math.floor(Math.random() * 89) + 11;
    num2 = Math.floor(Math.random() * 8) + 2;
    answer = num1 * num2;
  } else {
    const quotient = Math.floor(Math.random() * 89) + 11;
    num2 = Math.floor(Math.random() * 8) + 2;
    num1 = quotient * num2;
    answer = quotient;
  }
  return { id, type, num1, num2, answer };
};

const getUserStats = (): UserStats => {
  const data = localStorage.getItem('math_spark_stats');
  const stats = data ? JSON.parse(data) : { totalExp: 0 };
  let level = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (stats.totalExp >= LEVELS[i].minExp) {
      level = LEVELS[i].lv;
      break;
    }
  }
  return { totalExp: stats.totalExp, level };
};

const calculateExp = (correctCount: number, totalTime: number): number => {
  let exp = correctCount * 20; 
  if (correctCount === 5) exp += 50; 
  if (totalTime < 15) exp += 70;
  else if (totalTime < 25) exp += 40;
  else if (totalTime < 40) exp += 20;
  return exp;
};

const saveQuizSession = (session: QuizSession) => {
  const existing = localStorage.getItem('math_spark_history');
  const history = existing ? JSON.parse(existing) : [];
  localStorage.setItem('math_spark_history', JSON.stringify([...history, session].slice(-50)));
  
  const stats = getUserStats();
  localStorage.setItem('math_spark_stats', JSON.stringify({ totalExp: stats.totalExp + session.gainedExp }));
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// --- Components ---
const MathKeypad = ({ onKeyPress, onClear, onDelete, onSubmit }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4 bg-slate-900/80 backdrop-blur rounded-[32px] border border-slate-800 shadow-2xl">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => key === 'C' ? onClear() : key === '⌫' ? onDelete() : onKeyPress(key)}
          className={`h-16 sm:h-20 text-3xl font-black rounded-2xl active:scale-90 flex items-center justify-center transition-all ${
            key === 'C' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
            key === '⌫' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
            'bg-slate-800 text-white shadow-lg border-b-4 border-slate-950 active:border-b-0'
          }`}
        >
          {key}
        </button>
      ))}
      <button 
        onClick={onSubmit} 
        className="col-span-3 h-16 sm:h-20 bg-indigo-500 text-white text-2xl font-black rounded-2xl shadow-xl border-b-8 border-indigo-700 active:scale-95 transition-all mt-2 active:border-b-0"
      >
        확인
      </button>
    </div>
  );
};

const HistoryView = ({ onBack }) => {
  const existing = localStorage.getItem('math_spark_history');
  const history = existing ? [...JSON.parse(existing)].reverse() : [];
  return (
    <div className="flex-1 bg-slate-950 p-6 flex flex-col fade-in overflow-hidden h-full text-white">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-3 bg-slate-800 rounded-full shadow-md mr-4 active:scale-90">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black font-jua">훈련 기록</h1>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pb-10 pr-2">
        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-600 font-bold">아직 훈련 기록이 없습니다.</div>
        ) : (
          history.map((session: QuizSession, idx: number) => (
            <div key={idx} className="bg-slate-900 p-5 rounded-[24px] border border-slate-800 border-l-8 border-l-indigo-500 shadow-xl mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-black text-slate-400">{formatDate(session.date)}</div>
                <div className="text-2xl font-black text-white font-jua">{session.score}점</div>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>⏱️ {session.totalTime}초</span>
                <span className="text-indigo-400">+{session.gainedExp} XP</span>
              </div>
              <div className="flex gap-1">
                {session.questions.map((q, qIdx) => (
                  <div key={qIdx} className={`h-2 flex-1 rounded-full ${q.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [state, setState] = useState('START');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{isCorrect: boolean, correctAnswer: number, timeTaken: number} | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [userStats, setUserStats] = useState(getUserStats());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'START' || state === 'SUMMARY') {
      setUserStats(getUserStats());
    }
  }, [state]);

  useEffect(() => {
    if (state === 'QUIZ') {
      const start = Date.now();
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 100) / 10);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state, currentIdx]);

  const startQuiz = () => {
    const qList = Array.from({ length: 5 }, (_, i) => generateQuestion(`q-${Date.now()}-${i}`));
    setQuestions(qList);
    setCurrentIdx(0);
    setUserInput('');
    setLastFeedback(null);
    setState('QUIZ');
  };

  const handleSubmit = () => {
    if (userInput === '') return;
    const q = questions[currentIdx];
    const userAnsNum = parseInt(userInput);
    const isCorrect = userAnsNum === q.answer;
    const updated = [...questions];
    updated[currentIdx] = { ...q, userAnswer: userAnsNum, isCorrect, timeTaken: elapsed };
    setQuestions(updated);
    setLastFeedback({ isCorrect, correctAnswer: q.answer, timeTaken: elapsed });
    setState('FEEDBACK');
  };

  const currentLevelInfo = LEVELS.find(l => l.lv === userStats.level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find(l => l.lv === userStats.level + 1);
  const progress = nextLevelInfo 
    ? ((userStats.totalExp - currentLevelInfo.minExp) / (nextLevelInfo.minExp - currentLevelInfo.minExp)) * 100
    : 100;

  if (state === 'START') return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-white fade-in overflow-hidden relative">
      <div className="w-full max-w-sm bg-slate-900 rounded-[32px] p-6 mb-12 border border-slate-800 shadow-2xl relative">
        <div className="absolute top-2 right-4 text-7xl opacity-10">{currentLevelInfo.icon}</div>
        <div className="flex items-center gap-5 mb-5 relative z-10">
          <div className="text-6xl bg-slate-800 w-20 h-20 flex items-center justify-center rounded-2xl shadow-inner border border-slate-700">
            {currentLevelInfo.icon}
          </div>
          <div>
            <div className="text-indigo-400 font-black text-sm tracking-widest uppercase">LEVEL {userStats.level}</div>
            <div className="text-3xl font-black font-jua leading-tight">{currentLevelInfo.name}</div>
          </div>
        </div>
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-xs font-black text-slate-400">
            <span>EXP {userStats.totalExp}</span>
            <span>{nextLevelInfo ? `${nextLevelInfo.minExp - userStats.totalExp} XP 더 필요` : 'MAX LEVEL'}</span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-gradient transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <h1 className="text-5xl font-jua mb-2 sparkle-text">Math <span className="text-indigo-500">Spark</span></h1>
      <p className="text-slate-400 mb-12 font-bold text-center">집중하세요! 단 5문제면 충분합니다.</p>

      <div className="w-full max-w-xs space-y-4">
        <button onClick={startQuiz} className="w-full py-6 bg-indigo-500 text-white text-3xl font-black rounded-[32px] shadow-xl border-b-8 border-indigo-700 active:scale-95 active:border-b-0 transition-all">훈련 시작</button>
        <button onClick={() => setState('HISTORY')} className="w-full py-4 bg-slate-900 text-slate-300 border border-slate-800 text-xl font-bold rounded-2xl active:scale-95">히스토리</button>
      </div>
    </div>
  );

  if (state === 'QUIZ') {
    const q = questions[currentIdx];
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-white fade-in">
        <div className="p-4 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="flex justify-between items-center mb-8 px-2">
            <div className="font-jua text-indigo-400 text-xl">문제 {currentIdx + 1} / 5</div>
            <div className="text-indigo-400 font-black text-2xl font-mono">⏱️ {elapsed.toFixed(1)}s</div>
          </div>
          <div className="bg-slate-900 rounded-[40px] shadow-2xl p-10 text-center border border-slate-800 min-h-[300px] flex flex-col justify-center relative">
            <div className="text-7xl font-black mb-8 font-jua flex items-center justify-center gap-6">
              <span>{q.num1}</span>
              <span className="text-indigo-500 text-5xl">{q.type === 'multiplication' ? '×' : '÷'}</span>
              <span>{q.num2}</span>
            </div>
            <div className="text-6xl font-black bg-slate-950 py-7 rounded-3xl border-2 border-indigo-500/30 text-indigo-400 flex items-center justify-center min-h-[120px] shadow-inner font-jua">
              {userInput || '?'}
            </div>
          </div>
        </div>
        <div className="pb-10 px-4">
          <MathKeypad onKeyPress={v => setUserInput(p => p.length < 5 ? p + v : p)} onClear={() => setUserInput('')} onDelete={() => setUserInput(p => p.slice(0, -1))} onSubmit={handleSubmit} />
        </div>
      </div>
    );
  }

  if (state === 'FEEDBACK') {
    const { isCorrect, correctAnswer, timeTaken } = lastFeedback!;
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isCorrect ? 'bg-indigo-600' : 'bg-red-600'}`}>
        <div className="bg-slate-950 p-12 rounded-[56px] text-center w-full max-w-md shadow-2xl border-4 border-slate-900 scale-in">
          {isCorrect ? (
            <>
              <div className="text-8xl mb-6">✨</div>
              <h2 className="text-5xl font-black text-white mb-2 font-jua">정답입니다!</h2>
              <p className="text-indigo-300 text-xl font-bold">{timeTaken}초 만에 돌파!</p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">💡</div>
              <h2 className="text-4xl font-black text-white mb-3 font-jua">정답은 {correctAnswer}</h2>
              <p className="text-red-300 text-xl font-bold italic">"조금만 더 집중해봐요!"</p>
            </>
          )}
          <button 
            onClick={() => {
              if (currentIdx < 4) { 
                setCurrentIdx(p => p + 1); setUserInput(''); setLastFeedback(null); setState('QUIZ'); 
              } else { 
                const sc = questions.filter(q => q.isCorrect).length * 20; 
                const total = Math.round(questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0) * 10) / 10;
                const gained = calculateExp(questions.filter(q => q.isCorrect).length, total);
                saveQuizSession({ date: new Date().toISOString(), timestamp: Date.now(), questions, score: sc, totalTime: total, gainedExp: gained }); 
                setState('SUMMARY'); 
              }
            }} 
            className="w-full py-6 mt-10 bg-white text-slate-950 text-3xl font-black rounded-[32px] shadow-xl active:scale-95 transition-all"
          >
            {currentIdx < 4 ? '다음 문제' : '결과 보기'}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'SUMMARY') {
    const sc = questions.filter(q => q.isCorrect).length * 20;
    const totalTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0).toFixed(1);
    const gained = calculateExp(questions.filter(q => q.isCorrect).length, parseFloat(totalTime));
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 fade-in text-white">
        <div className="w-full max-w-md bg-slate-900 rounded-[48px] shadow-2xl p-10 border border-slate-800 text-center">
          <div className="text-7xl mb-6">{sc === 100 ? '👑' : '🎯'}</div>
          <h2 className="text-3xl font-jua mb-2">훈련 종료!</h2>
          <div className="text-8xl font-black text-indigo-500 mb-6 font-jua tracking-tighter">{sc}<span className="text-4xl ml-1">점</span></div>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800">
              <div className="text-slate-500 text-xs font-bold mb-1 uppercase">총 시간</div>
              <div className="text-xl font-black text-white">{totalTime}s</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800">
              <div className="text-slate-500 text-xs font-bold mb-1 uppercase">획득 XP</div>
              <div className="text-xl font-black text-indigo-400">+{gained}</div>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={startQuiz} className="w-full py-6 bg-indigo-500 text-white text-2xl font-black rounded-[32px] border-b-8 border-indigo-700 active:scale-95 active:border-b-0 transition-all">다시 훈련하기</button>
            <button onClick={() => setState('START')} className="w-full py-4 bg-slate-800 text-slate-400 text-xl font-bold rounded-[24px] border border-slate-700">메인으로</button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'HISTORY') return <HistoryView onBack={() => setState('START')} />;
  return null;
};

// React 18 방식의 렌더링
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
