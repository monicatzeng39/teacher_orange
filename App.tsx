import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Message } from './types.ts';
import { startChatSession, sendMessageStream } from './services/geminiService.ts';
import { INITIAL_MESSAGE } from './constants.ts';
import ChatMessage from './components/ChatMessage.tsx';
import Header from './components/Header.tsx';


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    startChatSession();
    // Add initial greeting
    setMessages([
      {
        id: 'init-1',
        role: 'model',
        text: INITIAL_MESSAGE,
      },
    ]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError(null);

    // Add user message
    const newMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: newMessageId, role: 'user', text: userText },
    ]);

    setIsLoading(true);

    try {
      // Create a placeholder for the bot response
      const botMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, role: 'model', text: '', isStreaming: true },
      ]);

      const streamResult = await sendMessageStream(userText);
      let fullText = '';

      for await (const chunk of streamResult as AsyncIterable<{ text: string }>) {
        const chunkText = chunk?.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: fullText } 
                : msg
            )
          );
        }
      }

      // Finish streaming
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (err) {
      console.error(err);
      setError('連線發生錯誤，請稍後再試。');
      // Remove the empty bot message if it failed completely
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
     if (window.confirm('確定要重新開始對話嗎？目前的記錄將會清除。')) {
        startChatSession();
        setMessages([
          {
            id: Date.now().toString(),
            role: 'model',
            text: INITIAL_MESSAGE,
          },
        ]);
        setError(null);
     }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 px-4 sm:px-6 max-w-3xl mx-auto w-full scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {error && (
          <div className="flex items-center justify-center p-4 mb-4 text-red-600 bg-red-50 rounded-lg border border-red-100">
            <AlertTriangle size={18} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-3xl mx-auto w-full flex items-end gap-2">
            <button 
                onClick={handleReset}
                className="p-3 text-gray-400 hover:text-orange-600 transition-colors"
                title="重新開始"
            >
                <RefreshCcw size={20} />
            </button>
          <div className="relative flex-1 bg-gray-100 rounded-2xl border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleInputResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="描述你的狀況..."
              className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-4 max-h-[120px] text-gray-800 placeholder-gray-500"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-full flex-shrink-0 transition-all shadow-md ${
              !inputValue.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
            }`}
          >
            <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               </div>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
                橘子老師僅供運動諮詢，如有劇痛或身體不適請立即停止並就醫。
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
