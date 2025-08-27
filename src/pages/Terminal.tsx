
import React from 'react';
import { RealTerminal } from '@/components/terminal/RealTerminal';

const Terminal = () => {
  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-green-500 bg-black">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-green-400 text-sm ml-2">Code-XI Real Terminal</span>
        </div>
        <div className="text-green-400 text-xs">
          ✅ REAL Backend | 🔄 Live Commands | 📁 File Operations | 🐙 GitHub Integration
        </div>
      </div>
      <div className="flex-1">
        <RealTerminal />
      </div>
    </div>
  );
};

export default Terminal;
