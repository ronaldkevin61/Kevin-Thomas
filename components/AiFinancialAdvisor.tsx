import React, { useState } from 'react';
import { Transaction, Member } from '../types';
import { generateFinancialAdvice } from '../services/geminiService';
import { Sparkles, Send, Loader2, Bot } from 'lucide-react';

interface AiFinancialAdvisorProps {
  transactions: Transaction[];
  members: Member[];
}

const SUGGESTED_QUERIES = [
  "Draft a thank you note for tithers",
  "Analyze our spending habits",
  "How can we reduce expenses?",
  "Summarize last month's income"
];

const AiFinancialAdvisor: React.FC<AiFinancialAdvisorProps> = ({ transactions, members }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAi = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await generateFinancialAdvice(transactions, members, query);
      setResponse(result);
    } catch (err) {
      setResponse("Sorry, I couldn't reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
             <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Smart Financial Assistant</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Powered by Gemini AI. Ask questions about your church finances, draft messages, or get budget advice specifically for your context.
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
          <input 
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 px-4 py-2"
            placeholder="Ask anything about your finances..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
          />
          <button 
            onClick={handleAskAi}
            disabled={isLoading || !query.trim()}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q, i) => (
                <button 
                    key={i}
                    onClick={() => setQuery(q)}
                    className="text-xs bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                >
                    {q}
                </button>
            ))}
        </div>
      </div>

      {response && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in relative">
            <div className="absolute -top-3 -left-3 bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-full">
                    <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{response}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default AiFinancialAdvisor;
