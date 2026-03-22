import React from 'react';

export const ViewHeader = ({ title, icon: Icon }) => (
  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/50 flex-shrink-0">
    <div>
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Icon className="text-slate-400" /> {title}
      </h2>
    </div>
  </div>
);
