import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { tacticalAudio } from '../../services/audioService';

export default function StealthCalculator() {
  const { setStealthMode } = useSecurity();
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [history, setHistory] = useState('');

  const handleDigit = (digit) => {
    setDisplay((prev) => (prev === '0' ? String(digit) : prev + digit));
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setHistory('');
  };

  const handleOp = (op) => {
    setPrevValue(parseFloat(display));
    setOperation(op);
    setHistory(`${display} ${op}`);
    setDisplay('0');
  };

  const handleEquals = () => {
    // Secret Uncloak trigger: 1091 or 1234
    if (display === '1091' || display === '1234' || (prevValue === 1091 && display === '0')) {
      tacticalAudio.playDisarmChime();
      setStealthMode(false);
      return;
    }

    if (prevValue === null || operation === null) return;
    const current = parseFloat(display);
    let result = 0;
    switch (operation) {
      case '+':
        result = prevValue + current;
        break;
      case '-':
        result = prevValue - current;
        break;
      case '×':
        result = prevValue * current;
        break;
      case '÷':
        result = current !== 0 ? prevValue / current : 'Error';
        break;
      default:
        return;
    }
    setDisplay(String(result));
    setHistory(`${prevValue} ${operation} ${current} =`);
    setPrevValue(null);
    setOperation(null);
  };

  const [tapCount, setTapCount] = useState(0);

  const handleHeaderTap = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount >= 3) {
      tacticalAudio.playDisarmChime();
      setStealthMode(false);
    }
    setTimeout(() => setTapCount(0), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121214] text-white flex flex-col items-center justify-center p-4">
      {/* Camouflage header */}
      <div className="w-full max-w-sm flex justify-between items-center px-3 py-2 text-xs text-neutral-400 font-sans border-b border-neutral-800">
        <span
          onClick={handleHeaderTap}
          className="cursor-pointer select-none"
          title="Triple tap to exit decoy"
        >
          Calculator
        </span>
        <button
          onClick={() => {
            tacticalAudio.playDisarmChime();
            setStealthMode(false);
          }}
          className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono"
        >
          Standard (Exit)
        </button>
      </div>

      <div className="w-full max-w-sm bg-[#1c1c1e] rounded-2xl p-5 shadow-2xl border border-neutral-800 my-auto">
        {/* Calc Display */}
        <div className="h-24 flex flex-col justify-end items-end pb-3 px-2 border-b border-neutral-800 mb-4">
          <div className="text-xs text-neutral-400 font-mono tracking-wider h-5">
            {history}
          </div>
          <div className="text-4xl font-light tracking-tight truncate max-w-full font-sans">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2.5 text-lg font-medium">
          <button
            onClick={handleClear}
            className="h-14 rounded-full bg-neutral-600 hover:bg-neutral-500 text-neutral-100 font-bold transition-colors cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={() => setDisplay((prev) => String(parseFloat(prev) * -1))}
            className="h-14 rounded-full bg-neutral-600 hover:bg-neutral-500 text-neutral-100 transition-colors cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={() => setDisplay((prev) => String(parseFloat(prev) / 100))}
            className="h-14 rounded-full bg-neutral-600 hover:bg-neutral-500 text-neutral-100 transition-colors cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOp('÷')}
            className="h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
          >
            ÷
          </button>

          {[7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xl transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('×')}
            className="h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
          >
            ×
          </button>

          {[4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xl transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('-')}
            className="h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
          >
            -
          </button>

          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xl transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOp('+')}
            className="h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
          >
            +
          </button>

          <button
            onClick={() => handleDigit(0)}
            className="col-span-2 h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xl pl-6 text-left transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => {
              if (!display.includes('.')) setDisplay((prev) => prev + '.');
            }}
            className="h-14 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xl transition-colors cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-14 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors cursor-pointer"
          >
            =
          </button>
        </div>

        {/* Discreet hint only visible to user */}
        <div className="mt-4 text-center">
          <span className="text-[10px] text-neutral-600 tracking-wider font-mono">
            [STEALTH ENGAGED // ENTER 1091= TO UNCLOAK]
          </span>
        </div>
      </div>
    </div>
  );
}
