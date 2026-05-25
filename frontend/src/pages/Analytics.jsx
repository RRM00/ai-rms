import React, { useState } from 'react';
import api from '../api/axios';

export const Analytics = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion('');
    setIsLoading(true);

    // Add user question to history immediately
    setHistory(prev => [...prev, { type: 'question', text: userQ }]);

    try {
      const res = await api.post('/ai/analytics', { question: userQ });
      setHistory(prev => [...prev, { type: 'answer', data: res.data }]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to process your question. Make sure the AI module is configured.';
      setHistory(prev => [...prev, { type: 'error', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "What are the top 3 most ordered items?",
    "How many orders were placed today?",
    "What is the total revenue from all orders?",
    "Show all menu items in the Mains category",
    "What is the average order total?",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center">
          <svg className="w-8 h-8 mr-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          AI Analytics
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Ask questions about your restaurant data in plain English. The AI translates them to SQL.</p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div>
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <p className="text-slate-400 text-lg mb-6">Ask me anything about your restaurant data</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {exampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="text-left text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-brand-500/50 p-3 rounded-lg transition-all"
                >
                  <span className="text-brand-400 mr-1">→</span> {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((entry, idx) => (
          <div key={idx}>
            {entry.type === 'question' && (
              <div className="flex justify-end">
                <div className="bg-brand-600/20 border border-brand-500/30 rounded-xl rounded-br-sm px-4 py-3 max-w-lg">
                  <p className="text-brand-100 text-sm">{entry.text}</p>
                </div>
              </div>
            )}

            {entry.type === 'answer' && (
              <div className="glass rounded-xl rounded-bl-sm p-5 space-y-4 max-w-2xl">
                {/* Human-readable answer */}
                <p className="text-slate-100 leading-relaxed">{entry.data.answer}</p>

                {/* SQL Query (collapsible) */}
                <details className="group">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M6 6L14 10L6 14V6Z"/></svg>
                    View SQL Query
                  </summary>
                  <pre className="mt-2 bg-slate-900/80 text-emerald-400 text-xs p-3 rounded-lg overflow-x-auto border border-slate-700 font-mono">
                    {entry.data.sql}
                  </pre>
                </details>

                {/* Results table */}
                {entry.data.results && entry.data.results.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm divide-y divide-slate-700 border border-slate-700 rounded-lg overflow-hidden">
                      <thead className="bg-slate-800/80">
                        <tr>
                          {Object.keys(entry.data.results[0]).map((col) => (
                            <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {entry.data.results.slice(0, 20).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-700/30">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="px-4 py-2 text-slate-300 whitespace-nowrap">
                                {val !== null ? String(val) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {entry.data.results.length > 20 && (
                      <p className="text-xs text-slate-500 mt-1">Showing first 20 of {entry.data.results.length} rows</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {entry.type === 'error' && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-xl rounded-bl-sm px-4 py-3 max-w-lg">
                <p className="text-red-300 text-sm">{entry.text}</p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="glass rounded-xl rounded-bl-sm px-5 py-4 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span className="text-sm text-slate-400">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAsk} className="flex gap-3 pt-4 border-t border-slate-700">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your restaurant data..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-brand-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </form>
    </div>
  );
};
