import React from 'react';
import { Smartphone, RefreshCcw, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function StepOneCurrentState({ onSelectState }) {
  const options = [
    {
      id: 'no_whatsapp',
      title: 'No, I have a fresh number',
      description: 'The number has never been used on WhatsApp before.',
      icon: <Smartphone className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'has_app',
      title: 'Yes, on WhatsApp Business App',
      description: 'Currently using the standard WhatsApp Business App on a phone.',
      icon: <RefreshCcw className="w-6 h-6 text-orange-500" />
    },
    {
      id: 'has_api',
      title: 'Yes, already on WhatsApp API',
      description: 'Already using the Cloud API or another provider (e.g. MSG91, Wati).',
      icon: <LogIn className="w-6 h-6 text-green-500" />
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-700 mb-4">
        Is your number currently active on WhatsApp?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map(option => (
          <button
            key={option.id}
            onClick={() => onSelectState(option.id)}
            className="flex flex-col items-start p-4 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all bg-slate-50 group"
          >
            <div className="mb-3 p-2 bg-white rounded-md shadow-sm group-hover:scale-105 transition-transform">
              {option.icon}
            </div>
            <h4 className="font-semibold text-slate-800">{option.title}</h4>
            <p className="text-sm text-slate-500 mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
