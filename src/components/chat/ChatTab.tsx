import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiKeyBanner } from '../common/ApiKeyBanner';
import { callGroqChat } from '../../lib/groq/client';

export const ChatTab: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChatHistory,
    candidates,
    currentJD,
    settings,
    setSelectedCandidate,
    showToast
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Who are the top 3 candidates and why?',
    'Which candidates know PyTorch and Kubernetes?',
    'Compare the top 2 candidates',
    'Are there any candidates with red flags?',
    'Draft a shortlist interview invitation email'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    setInput('');
    addChatMessage({
      sender: 'user',
      content: query
    });

    setIsTyping(true);

    try {
      if (settings.groqApiKey && settings.groqApiKey.trim().length > 0) {
        // Build concise context of top candidates and active JD
        const candidateContext = candidates
          .slice(0, 8)
          .map(
            (c) =>
              `- [${settings.blindScreening ? c.blindName : c.parsedData.name}] (Rank #${c.rank}, Score: ${c.finalScore}/100, Exp: ${c.parsedData.totalExperienceYears} yrs, Degree: ${c.parsedData.education[0]?.degree || 'N/A'}, Skills: ${c.parsedData.skills.slice(0, 8).join(', ')}, Verdict: ${c.llmAnalysis?.one_line_verdict || 'N/A'})`
          )
          .join('\n');

        const systemPrompt = `You are the TalentRank AI recruiting copilot.
Active Job Description: "${currentJD.title}"
Required Skills: ${currentJD.requiredSkills.join(', ')}
Min Experience: ${currentJD.minExperienceYears} years.

Current Evaluated Candidate Pool:
${candidateContext}

Instructions:
1. Answer the recruiter's inquiry with high precision, referencing specific scores, skills, and background details.
2. When you mention a candidate, surround their name in double brackets like [[Elena Rostova]] or [[Candidate #1 (MLE)]] so the UI can convert it to an interactive candidate card.
3. Be professional, direct, and structured. Use Markdown bullet points where helpful.`;

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...chatMessages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.content
          })),
          { role: 'user', content: query }
        ];

        const response = await callGroqChat(messages, settings);

        addChatMessage({
          sender: 'assistant',
          content: response
        });
      } else {
        // Fallback local intelligence when Groq key is not configured
        let response = '';
        const qLower = query.toLowerCase();

        if (qLower.includes('top 3') || qLower.includes('top')) {
          const top3 = candidates.slice(0, 3);
          response = `Here are the **Top 3 Candidates** for the **${currentJD.title}** role based on our hybrid NLP and skill scoring pipeline:\n\n` +
            top3.map((c, i) => `**${i + 1}. [[${settings.blindScreening ? c.blindName : c.parsedData.name}]]** (Score: **${c.finalScore}/100**, Rank #${c.rank})\n- **Experience:** ${c.parsedData.totalExperienceYears} years\n- **Education:** ${c.parsedData.education[0]?.degree || 'Degree'}\n- **Why:** ${c.explanation}`).join('\n\n');
        } else if (qLower.includes('pytorch') || qLower.includes('docker') || qLower.includes('skill')) {
          const matching = candidates.filter((c) =>
            c.parsedData.skills.some((s) => s.toLowerCase().includes('pytorch') || s.toLowerCase().includes('docker'))
          );
          response = `Found **${matching.length} candidates** with matching skill competencies:\n\n` +
            matching.map((c) => `- **[[${settings.blindScreening ? c.blindName : c.parsedData.name}]]** (Score: ${c.finalScore}/100) — Skills: ${c.parsedData.skills.slice(0, 6).join(', ')}`).join('\n');
        } else if (qLower.includes('red flag')) {
          const flagged = candidates.filter((c) => (c.llmAnalysis?.red_flags?.length || 0) > 0);
          if (flagged.length > 0) {
            response = `Identified potential red flags in the following candidate profiles:\n\n` +
              flagged.map((c) => `- **[[${settings.blindScreening ? c.blindName : c.parsedData.name}]]**: ${c.llmAnalysis?.red_flags.join(', ')}`).join('\n');
          } else {
            response = `No high-severity red flags detected across the current candidate pool.`;
          }
        } else if (qLower.includes('email') || qLower.includes('invite')) {
          const top = candidates[0];
          const topName = top ? (settings.blindScreening ? top.blindName : top.parsedData.name) : 'Candidate';
          response = `### Interview Invitation Draft\n\n**Subject:** Interview Invitation: ${currentJD.title} at our team\n\nDear ${topName},\n\nWe were very impressed by your background, particularly your work in deep learning pipelines and production engineering. We would love to invite you to an initial 45-minute technical conversation to discuss the ${currentJD.title} position.\n\nPlease let us know your availability over the next few days.\n\nBest regards,\nRecruiting Team`;
        } else {
          const top = candidates[0];
          response = `Based on our hybrid screening data for **${currentJD.title}**, we have evaluated **${candidates.length} candidates**.\n\nThe highest-ranking candidate is **[[${top ? (settings.blindScreening ? top.blindName : top.parsedData.name) : 'Top Candidate'}]]** with an overall score of **${top?.finalScore}/100**.\n\n*Tip: Connect your free Groq API key in Settings to unlock deep conversational queries.*`;
        }

        // Add a slight typing delay for realism
        await new Promise((r) => setTimeout(r, 600));

        addChatMessage({
          sender: 'assistant',
          content: response
        });
      }
    } catch (err: any) {
      showToast(`AI Assistant error: ${err.message}`, 'error');
      addChatMessage({
        sender: 'assistant',
        content: `I encountered an issue processing your request: ${err.message}. Please verify your Groq API configuration in Settings.`
      });
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Render text with clickable candidate chip replacement for [[Name]]
   */
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[\[.*?\]\])/g);

    return parts.map((part, index) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const candidateName = part.slice(2, -2).trim();
        const matchedCandidate = candidates.find((c) => {
          const actualName = settings.blindScreening ? c.blindName : c.parsedData.name;
          return (
            actualName.toLowerCase() === candidateName.toLowerCase() ||
            c.parsedData.name.toLowerCase() === candidateName.toLowerCase() ||
            c.blindName.toLowerCase() === candidateName.toLowerCase()
          );
        });

        if (matchedCandidate) {
          return (
            <button
              key={index}
              onClick={() => setSelectedCandidate(matchedCandidate)}
              className="inline-flex items-center gap-1 mx-1 rounded-md bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800 hover:bg-indigo-200 shadow-2xs dark:bg-indigo-900/60 dark:text-indigo-200 transition-colors"
              title="Click to view full candidate profile"
            >
              <span>{candidateName}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </button>
          );
        }
        return <strong key={index}>{candidateName}</strong>;
      }

      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">TalentRank AI Copilot</h2>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Grounded in {candidates.length} Resumes
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Context: {currentJD.title}</p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <RotateCcw className="h-3 w-3" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="px-6 pt-3">
        <ApiKeyBanner featureName="AI Chat Assistant" />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`group relative max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none dark:bg-slate-800/80 dark:border-slate-800 dark:text-slate-200'
                }`}
              >
                {renderMessageContent(msg.content)}

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className={`absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                    isUser
                      ? 'text-white/80 hover:text-white'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Copy message"
                >
                  {copiedId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
            <Bot className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            <span>TalentRank AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="border-t border-slate-100 px-6 py-2.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Suggested:</span>
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isTyping}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 shadow-2xs transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about candidates, skill comparisons, or draft an email..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
