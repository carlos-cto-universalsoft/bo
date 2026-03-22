import React from 'react';

export const ScrollbarStyle = () => (
  <style>{`
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0B1120; border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #D10057; }
    * { scrollbar-width: thin; scrollbar-color: #374151 #0B1120; }
    
    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 4px; margin: 0 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 4px; border: 1px solid #0B1120; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D10057; }
  `}</style>
);
