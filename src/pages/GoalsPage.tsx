"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Goal } from '../types.ts';
import GoalCard from '../components/GoalCard.tsx';

interface GoalsPageProps {
  goals: Goal[];
  onDeleteGoal: (goal: Goal) => void;
  onDeposit: (goal: Goal) => void;
  onViewAnalysis: (goal: Goal) => void;
  setIsGoalModalOpen: (isOpen: boolean) => void;
}

const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onDeleteGoal,
  onDeposit,
  onViewAnalysis,
  setIsGoalModalOpen,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(g => (
          <GoalCard 
            key={g.id} 
            goal={g} 
            onDeposit={onDeposit} 
            onDelete={onDeleteGoal} 
            onViewDetails={onViewAnalysis} 
          />
        ))}
        <button 
          onClick={() => setIsGoalModalOpen(true)}
          className="bg-white border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
        >
          <Plus className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
          <p className="font-black text-slate-800 text-xs">Nova Meta</p>
        </button>
      </div>
    </div>
  );
};

export default GoalsPage;