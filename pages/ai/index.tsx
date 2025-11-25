// pages/ai.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Sparkles, Send, User, Bot, RotateCcw, 
  ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Analytics } from "@vercel/analytics/next"
// 1. IMPORT LIBRARY MARKDOWN
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChatPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Ref untuk auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      id: '1',
      content: 'Halo! Saya AI Assistant Desa Wisata Batik Giriloyo. Saya bisa membantu Anda mencari rekomendasi batik, menjawab pertanyaan tentang produk, memberikan informasi tentang batik, dan membantu proses pemesanan. Apa yang bisa saya bantu untuk Anda hari ini?',
      isUser: false,
      timestamp: new Date(),
    }]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan sistem. Silakan refresh halaman dan coba lagi.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{
      id: '1',
      content: 'Halo! Saya AI Assistant Desa Wisata Batik Giriloyo. Ada yang bisa saya bantu?',
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  const quickQuestions = [
    "Rekomendasi batik untuk acara formal",
    "Apa perbedaan batik tulis dan cap?",
    "Apa itu desa wisata batik Giriloyo?",
    "Proses pembuatan batik tulis",
    "Apa itu NFT certificate?",
    "Apa motif batik yang paling populer?",
    "Bagaimana cara merawat batik tulis?",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-50">
      <Analytics />
      <Navbar/>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full transition"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              AI Batik Assistant
            </h1>
            <p className="text-stone-600 mt-1">
              Dapatkan rekomendasi personal dan jawaban tentang batik
            </p>
          </div>
          <button
            onClick={resetChat}
            className="flex items-center gap-2 bg-white text-stone-700 px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition"
          >
            <RotateCcw size={16} />
            Reset Chat
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                <Sparkles size={16} />
                Pertanyaan Cepat
              </h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="w-full text-left p-3 text-sm text-stone-600 hover:bg-purple-50 rounded-lg transition border border-stone-100 hover:border-purple-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isUser && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] ${message.isUser ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl p-4 ${
                        message.isUser 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        
                        {/* 2. IMPLEMENTASI REACT MARKDOWN */}
                        <div className="prose prose-sm max-w-none break-words">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Kustomisasi elemen HTML agar styling Tailwind tetap rapi
                              p: ({node, ...props}) => <p className={`mb-2 last:mb-0 ${message.isUser ? 'text-white' : 'text-stone-800'}`} {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="" {...props} />,
                              a: ({node, ...props}) => <a className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                      </div>
                      <div className={`text-xs text-stone-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                        {message.timestamp.toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.isUser && (
                      <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center shrink-0">
                        <User size={16} className="text-stone-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-stone-100 rounded-2xl p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="border-t border-stone-200 p-4 bg-white z-10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ketik pertanyaan atau minta rekomendasi..."
                    className="text-stone-800 flex-1 border border-stone-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-xs text-stone-500 text-center mt-2">
                  AI mungkin membuat kesalahan. Periksa informasi penting dengan customer service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIChatPage;