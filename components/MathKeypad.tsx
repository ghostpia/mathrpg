
import React from 'react';

interface MathKeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}

const MathKeypad: React.FC<MathKeypadProps> = ({ onKeyPress, onClear, onDelete, onSubmit }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto p-4 bg-slate-900 rounded-[32px] shadow-2xl border border-slate-800 mt-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === 'C') onClear();
            else if (key === '⌫') onDelete();
            else onKeyPress(key);
          }}
          className={`
            h-16 sm:h-20 text-3xl font-black rounded-2xl transition-all active:scale-90 flex items-center justify-center
            ${key === 'C' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
              key === '⌫' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
              'bg-slate-800 text-slate-100 shadow-lg border-b-4 border-slate-950 active:border-b-0'}
          `}
        >
          {key}
        </button>
      ))}
      <button
        onClick={onSubmit}
        className="col-span-3 h-16 sm:h-20 bg-indigo-500 text-white text-2xl font-black rounded-2xl shadow-xl border-b-8 border-indigo-700 active:scale-95 active:border-b-0 transition-all mt-2"
      >
        정답 전송!
      </button>
    </div>
  );
};

export default MathKeypad;
