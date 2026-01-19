
import React, { useState, useEffect } from 'react';
import { Question, QuizSession, LEVELS } from './types.ts';
import { generateQuestion, saveQuizSession, getUserStats, calculateExp } from './utils.ts';
import MathKeypad from './components/MathKeypad.tsx';
import HistoryView from './components/HistoryView.tsx';

type AppState = 'START' | 'QUIZ' | 'FEEDBACK' | 'SUMMARY' | 'HISTORY';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('START');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; correctAnswer: number; timeTaken: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [userStats, setUserStats] = useState(getUserStats());

  useEffect(() => {
    if (state === 'START' || state === 'SUMMARY') {
      setUserStats(getUserStats());
    }
  }, [state]);

  useEffect(() => {
    if (state === 'QUIZ') {
      setStartTime(Date.now());
    }
  }, [state, currentIdx]);

  const startQuiz = () => {
    const newQuestions = Array.from({ length: 5 }, (_, i) => generateQuestion(`q-${Date.now()}-${i}`));
    setQuestions(newQuestions);
    setCurrentIdx(0);
    setUserInput('');
    setLastFeedback(null);
    setState('QUIZ');
  };

  const handleSubmit = () => {
    if (userInput === '') return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000 * 10) / 10;
    const currentQuestion = questions[currentIdx];
    const isCorrect = parseInt(userInput) === currentQuestion.answer;
    
    const updatedQuestions = [...questions];
    updatedQuestions[currentIdx] = { ...currentQuestion, userAnswer: parseInt(userInput), isCorrect, timeTaken };
    setQuestions(updatedQuestions);
    setLastFeedback({ isCorrect, correctAnswer: currentQuestion.answer, timeTaken });
    setState('FEEDBACK');
  };

  const nextQuestion = () => {
    if (currentIdx < 4) {
      setCurrentIdx(prev => prev + 1);
      setUserInput('');
      setLastFeedback(null);
      setState('QUIZ');
    } else {
      const correctCount = questions.filter(q => q.isCorrect).length;
      const totalTime = questions.reduce((acc, q) => acc + (q.timeTaken || 0), 0);
      const gainedExp = calculateExp(correctCount, totalTime);
      
      const session: QuizSession = {
        date: new Date().toISOString(),
        timestamp: Date.now(),
        questions: questions,
        score: correctCount * 20,
        totalTime: Math.round(totalTime * 10) / 10,
        gainedExp
      };
      saveQuizSession(session);
      setState('SUMMARY');
    }
  };

  const currentLevelInfo = LEVELS.find(l => l.lv === userStats.level) || LEVELS[0];
  const nextLevelInfo = LEVELS.find(l => l.lv === userStats.level + 1);
  const progress = nextLevelInfo 
    ? ((userStats.totalExp - currentLevelInfo.minExp) / (nextLevelInfo.minExp - currentLevelInfo.minExp)) * 100
    : 100;

  if (state === 'START') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-white fade-in overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20"></div>
        
        {/* Level Card */}
        <div className="w-full max-w-sm bg-slate-800/50 backdrop-blur-lg rounded-[32px] p-6 mb-10 border border-slate-700 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl bg-slate-700 w-20 h-20 flex items-center justify-center rounded-2xl shadow-inner border border-slate-600">
              {currentLevelInfo.icon}
            </div>
            <div>
              <div className="text-indigo-400 font-black text-sm tracking-widest uppercase">Level {userStats.level}</div>
              <div className="text-2xl font-black font-jua">{currentLevelInfo.name}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>EXP {userStats.totalExp}</span>
              <span>{nextLevelInfo ? `${nextLevelInfo.minExp} 까지` : 'MAX'}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black mb-8 font-jua tracking-tighter text-center">
          <span className="text-indigo-400">Math</span> Spark
        </h1>

        <div className="w-full max-w-xs space-y-4">
          <button onClick={startQuiz} className="w-full py-6 bg-indigo-500 text-white text-3xl font-black rounded-3xl shadow-xl active:scale-95 border-b-8 border-indigo-700">트레이닝 시작</button>
          <button onClick={() => setState('HISTORY')} className="w-full py-4 bg-slate-800 text-slate-300 border border-slate-700 text-lg font-bold rounded-2xl active:scale-95">기록 및 랭크</button>
        </div>
      </div>
    );
  }

  if (state === 'QUIZ') {
    const q = questions[currentIdx];
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-white fade-in">
        <div className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-6">
            <div className="font-jua text-indigo-400">문제 {currentIdx + 1} / 5</div>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className={`w-10 h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-indigo-400 scale-y-125' : i < currentIdx ? (questions[i].isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 border border-slate-800 shadow-2xl text-center">
            <div className="text-6xl font-black flex items-center justify-center gap-6 py-8 font-jua">
              <span>{q.num1}</span>
              <span className="text-indigo-500 text-4xl">{q.type === 'multiplication' ? '×' : '÷'}</span>
              <span>{q.num2}</span>
            </div>
            <div className="text-5xl font-black bg-slate-950 py-6 rounded-3xl border-2 border-indigo-500/30 text-indigo-400 min-h-[100px] flex items-center justify-center shadow-inner font-jua">
              {userInput || '?'}
            </div>
          </div>
        </div>
        <div className="pb-8 px-4"><MathKeypad onKeyPress={k => setUserInput(p => p.length < 5 ? p + k : p)} onClear={() => setUserInput('')} onDelete={() => setUserInput(p => p.slice(0, -1))} onSubmit={handleSubmit} /></div>
      </div>
    );
  }

  if (state === 'FEEDBACK') {
    const { isCorrect, correctAnswer, timeTaken } = lastFeedback!;
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isCorrect ? 'bg-indigo-600' : 'bg-red-600'}`}>
        <div className="bg-slate-900 p-10 rounded-[48px] text-center w-full max-w-md shadow-2xl border-4 border-slate-800 scale-in">
          <div className="text-7xl mb-4">{isCorrect ? '⚡️' : '💥'}</div>
          <h2 className="text-4xl font-black text-white mb-2 font-jua uppercase tracking-widest">{isCorrect ? 'Success!' : 'Oops!'}</h2>
          <div className="text-xl text-slate-400 font-bold mb-6">
            {isCorrect ? `${timeTaken}초 만에 해결!` : `정답은 ${correctAnswer} 였습니다.`}
          </div>
          <button onClick={nextQuestion} className="w-full py-5 bg-white text-slate-900 text-2xl font-black rounded-3xl shadow-xl active:scale-95 transition-all">다음 단계로</button>
        </div>
      </div>
    );
  }

  if (state === 'SUMMARY') {
    const lastSession = questions;
    const correctCount = lastSession.filter(q => q.isCorrect).length;
    const totalTime = lastSession.reduce((acc, q) => acc + (q.timeTaken || 0), 0);
    const gainedExp = calculateExp(correctCount, totalTime);

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-white fade-in">
        <div className="w-full max-w-md bg-slate-900 rounded-[48px] p-8 border border-slate-800 shadow-2xl text-center">
          <div className="text-indigo-400 font-black text-sm mb-2">훈련 종료</div>
          <h2 className="text-3xl font-jua mb-6">스테이지 클리어!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-3xl">
              <div className="text-slate-400 text-xs font-bold mb-1">정답수</div>
              <div className="text-2xl font-black text-green-400">{correctCount} / 5</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-3xl">
              <div className="text-slate-400 text-xs font-bold mb-1">획득 XP</div>
              <div className="text-2xl font-black text-indigo-400">+{gainedExp}</div>
            </div>
          </div>

          <div className="mb-10 text-left">
            <div className="flex justify-between text-xs font-black text-slate-500 mb-2">
              <span>LEVEL {userStats.level} PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <button onClick={() => setState('START')} className="w-full py-5 bg-indigo-500 text-white text-2xl font-black rounded-3xl shadow-xl active:scale-95 border-b-8 border-indigo-700">기지로 귀환</button>
        </div>
      </div>
    );
  }

  if (state === 'HISTORY') return <HistoryView onBack={() => setState('START')} />;
  return null;
};

export default App;
