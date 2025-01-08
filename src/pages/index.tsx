import React, { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import { Input } from '../components/input';
import { useHistory } from '../components/history/hook';
import { History } from '../components/history/History';
import { banner } from '../utils/bin';
import { ChevronDown } from "lucide-react";
import { TopBar } from '../components/TopBar';
import { Navigation } from '../components/Navigation';
import { NewsBar } from '../components/NewsBar';

const BannerPost = () => (
  <div className="border-[#76E4F7] border-2 p-6 mb-8">
    <div className="grid grid-cols-1">
      <div className="relative">
      <img src="/profile.png" alt="Banner" className="w-full h-[auto] object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
          <div className="text-[#76E4F7] font-mono">Symponhy Dolphin</div>
          <h3 className="text-[#76E4F7] text-2xl font-mono mt-2">
            From the Terminal, We Build a Better Tomorrow
          </h3>
          <div className="flex gap-4 mt-2 text-[#76E4F7] font-mono">
            <span>Powered by $SYDO 🐬 |</span>
            <span>December 25, 2025</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const titleRef = useRef(null);
  const [underlineWidth, setUnderlineWidth] = useState(0);

  useEffect(() => {
    if (titleRef.current) {
      setUnderlineWidth(titleRef.current.offsetWidth);
    }
  }, []);

  const faqs = [
    {
      question: "What is Symphony Dolphin?",
      answer: "Symphony Dolphin is a revolutionary blockchain project built on Solana, combining DeFi capabilities with unique social features to create a seamless ecosystem for crypto enthusiasts."
    },
    {
      question: "How can I participate in the airdrop?",
      answer: "To participate in the airdrop, connect your Solana wallet, complete the required tasks such as following our social media channels, and join our community. Detailed instructions will be available in the airdrop section."
    },
    {
      question: "What makes Symphony Dolphin unique?",
      answer: "Symphony Dolphin stands out with its innovative approach to DeFi, combining high-speed Solana infrastructure with user-friendly features, community governance, and sustainable tokenomics."
    },
    {
      question: "How can I stay updated with project developments?",
      answer: "Follow our official X/Twitter and Telegram channels for the latest updates, announcements, and community discussions. We regularly share progress updates and upcoming features."
    }
  ];

  return (
    <div className="border-[#76E4F7] border-2 p-6">
      <div className="flex justify-between items-center mb-6">
      <div className="relative">
          <h2 ref={titleRef} className="text-[#76E4F7] font-mono text-xl">Frequently Asked Questions</h2>
          <div 
            className="absolute -bottom-2 left-0 h-0.5 bg-[#76E4F7]" 
            style={{ width: `${underlineWidth}px` }}
          />
        </div>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="opacity-0"
            style={{
              animation: 'fadeIn 0.5s ease-out forwards',
              animationDelay: `${index * 150}ms`,
            }}
          >
            <div className="border border-[#76E4F7] overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full flex justify-between items-center p-4 text-[#76E4F7] hover:bg-[#76E4F7]/5 transition-all duration-300 ${
                  openIndex === index ? 'bg-[#76E4F7]/10' : ''
                }`}
              >
                <span className="font-mono text-left">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#76E4F7] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div 
                className={`transition-all duration-300 origin-top ${
                  openIndex === index 
                    ? 'max-h-[500px] opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 text-[#76E4F7] font-mono border-t border-[#76E4F7] bg-[#76E4F7]/5">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const Terminal = () => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const {
    history,
    command,
    lastCommandIndex,
    setCommand,
    setHistory,
    clearHistory,
    setLastCommandIndex,
  } = useHistory([]);

  const init = React.useCallback(() => setHistory(banner()), []);

  React.useEffect(() => {
    init();
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [init]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [history]);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      <Head>
        <title>Symphony Dolphin</title>
      </Head>

      <div className="flex flex-col min-h-screen">
        <TopBar />
        <Navigation />
        <NewsBar />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div id="terminal-section" className="border-[#76E4F7] border-2 p-6 mb-8">
            <div ref={containerRef} className="h-[500px] overflow-y-auto text-[#76E4F7] font-mono">
              <History history={history} />
              <Input
                inputRef={inputRef}
                containerRef={containerRef}
                command={command}
                history={history}
                lastCommandIndex={lastCommandIndex}
                setCommand={setCommand}
                setHistory={setHistory}
                setLastCommandIndex={setLastCommandIndex}
                clearHistory={clearHistory}
              />
            </div>
          </div>

          <BannerPost />
          <FAQ />
        </main>
      </div>
    </div>
  );
};

export default Terminal;