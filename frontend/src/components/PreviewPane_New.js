import React, { useState } from 'react';
import { Brain, Sparkles, Send, FileSearch, MessageSquare } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import FileViewer from './FileViewer';

const PreviewPane = ({ activeTab, onTabSwitch, selectedFile, aiSummary, aiSummaryFile }) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const { askAI } = useSearch();

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAskingAI(true);
    try {
      const fileId = selectedFile ? selectedFile.path : null;
      const result = await askAI(aiQuestion, 5, fileId);
      
      if (result.success) {
        setAiResponse(result.answer || result.summary);
      } else {
        setAiResponse(`Error: ${result.error}`);
      }
    } catch (err) {
      setAiResponse('Failed to get AI response. Please try again.');
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <aside className="w-[440px] glass flex flex-col transition-colors duration-300">
      {/* Modern Segmented Tab Bar */}
      <div className="p-3 border-b border-white/10 dark:border-white/5">
        <div className="flex bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl">
          <button 
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 ${
              activeTab === 'preview' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => onTabSwitch('preview')}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>
          <button 
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1.5 ${
              activeTab === 'insight' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => onTabSwitch('insight')}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Preview Tab Content */}
      {activeTab === 'preview' && (
        <div className="flex-1 overflow-hidden">
          <FileViewer 
            selectedFile={selectedFile}
            onError={(error) => console.error('File viewer error:', error)}
          />
        </div>
      )}

      {/* AI Insight Tab Content */}
      {activeTab === 'insight' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {/* Summary Box */}
          <div className="glass rounded-2xl p-4 border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center">
                <Brain className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                Executive Summary
              </h3>
              {aiSummaryFile && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                  {aiSummaryFile}
                </span>
              )}
            </div>
            {aiSummary ? (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/5 dark:border-white/5">
                {aiSummary}
              </p>
            ) : (
              <div className="text-center py-6 px-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1.5 opacity-60" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">No document summarized yet</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Click "Summarize" on any search result to extract insights</p>
              </div>
            )}
          </div>

          {/* Key Concepts */}
          <div className="glass rounded-2xl p-4 border border-black/5 dark:border-white/5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-2.5">
              Key Concepts & Entities
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Semantic Vector Embeddings</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Cosine Similarity Ranking</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Contextual Synthesis & Retrieval</span>
              </div>
            </div>
          </div>

          {/* Ask AI Section */}
          <div className="glass rounded-2xl p-4 border border-black/5 dark:border-white/5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 mb-2.5 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              Ask File Assistant
            </h4>
            <div className="space-y-2.5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask a question about this file or topic..." 
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isAskingAI && handleAskAI()}
                  className="w-full pl-3 pr-10 py-2 rounded-xl glass border border-black/10 dark:border-white/10 text-xs text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
                <button 
                  onClick={handleAskAI}
                  disabled={isAskingAI || !aiQuestion.trim()}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                  title="Send question"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* AI Response Bubble */}
              {aiResponse && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <h5 className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 mb-1 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Assistant Response
                  </h5>
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default PreviewPane;
