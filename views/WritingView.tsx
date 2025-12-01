import React, { useState } from 'react';
import { generateCreativeText } from '../services/geminiService';
import { PenTool, Check, Copy, RefreshCw, FileText } from 'lucide-react';

export const WritingView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<'blog' | 'email' | 'summary' | 'poem'>('blog');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setOutput('');
    try {
        const res = await generateCreativeText(topic, format);
        setOutput(res);
    } catch (e) {
        setOutput("Error generating text. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formats = [
    { id: 'blog', label: 'Blog Post' },
    { id: 'email', label: 'Professional Email' },
    { id: 'summary', label: 'Summary' },
    { id: 'poem', label: 'Creative Poem' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">AI Writer</h1>
        <p className="text-slate-400">Generate professional content in seconds.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-xl">
        {/* Controls */}
        <div className="p-6 border-b border-slate-800 space-y-6">
            <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">What do you want to write about?</label>
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. The future of renewable energy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">Choose Format</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formats.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFormat(f.id as any)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                format === f.id 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!topic.trim() || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    !topic.trim() || loading
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-xl shadow-emerald-900/20 hover:scale-[1.01]'
                }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <PenTool />}
                {loading ? 'Writing Magic...' : 'Generate Content'}
            </button>
        </div>

        {/* Output */}
        <div className="min-h-[300px] relative bg-slate-950/50 rounded-b-2xl">
            {output ? (
                <div className="p-6 md:p-8">
                     <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            {copied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18} />}
                        </button>
                    </div>
                    <div className="prose prose-invert prose-lg max-w-none">
                         <div className="whitespace-pre-wrap text-slate-300 font-light leading-loose">
                            {output}
                         </div>
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                    <FileText size={64} className="mb-4 opacity-20" />
                    <p>Your content will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};