import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, User, CheckCircle2, XCircle, ExternalLink, Train, ImagePlus, X } from 'lucide-react';
import ProfileCard from './ProfileCard';

const getDefaultAvatar = (seed) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

const QUIZ_DATA = [
  { q: "Who is the real architect of the ETH ecosystem?", options: ["Satoshi Mama", "Vitalik Bhau Buterin", "Elon Musk", "Gavin Wood"], correct: 1, fact: "Ek Number! Vitalik Bhau actually visited India and donated $1B+ in SHIB to the Covid Relief Fund!" },
  { q: "What is the smallest unit of ETH used for 'fare'?", options: ["Wei", "Gwei", "Satoshi", "Finney"], correct: 1, fact: "Gwei is the 'Chillar' of Ethereum. Always keep some for the network rickshaw-walas!" },
  { q: "Where do you go for faster, cheaper transactions?", options: ["Layer 2", "Layer 0", "Sidechain", "Metaverse"], correct: 0, fact: "Layer 2s are like the Fast Locals—they bypass the main chain crowd to get you there quickly!" },
  { q: "Which 'Bhasha' (language) is used for dApps?", options: ["Solidity", "Python", "HTML", "Java"], correct: 0, fact: "Solidity is the cement and brick of the Ethereum world. Without it, no building!" },
  { q: "What is the real purpose of ETHMumbai?", options: ["Tourist mode", "To BUIDL things", "Selfies", "Free Merch"], correct: 1, fact: "BUIDLing is the soul of Mumbai. From startups to smart contracts, we grind!" }
];

const RANKS = [
  { max: 40, title: "Townie Tourist", desc: "Ae Yedya! BUIDL something first." },
  { max: 75, title: "Fast Local Pro", desc: "Solid! You know your way around the chain." },
  { max: 100, title: "Mumbai Eth-Lord", desc: "Ek Number! You are the real deal." }
];

const getRank = (score) => RANKS.find(r => score <= r.max) || RANKS[2];

export default function App() {
  const [step, setStep] = useState('landing');
  const [handle, setHandle] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [isWeb3Native, setIsWeb3Native] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const fileInputRef = useRef(null);

  const avatarUrl = customAvatar || getDefaultAvatar(handle || 'ethmumbai');
  const question = QUIZ_DATA[currentQuestion];
  const isLastQuestion = currentQuestion === QUIZ_DATA.length - 1;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCustomAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCustomAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!handle) return;
    setIsWeb3Native(handle.toLowerCase().endsWith('.eth') || handle.toLowerCase().startsWith('0x'));
    setStep('quiz');
  };

  const handleAnswer = (index) => {
    const isCorrect = index === question.correct;
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) setScore(s => s + 1);
    setShowFact(true);
  };

  const nextStep = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(q => q + 1);
      setShowFact(false);
    } else {
      const total = Math.round(25 + (isWeb3Native ? 25 : 0) + (score / QUIZ_DATA.length) * 50);
      setFinalScore(total);
      setStep('result');
    }
  };

  const shareResult = () => {
    const text = `I just checked my ETHMumbai Maxi Score: ${finalScore}/100! 🚀 Status: ${getRank(finalScore).title}. Can you beat me? #ETHMumbai #Ethereum`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const reset = () => {
    setStep('landing');
    setHandle('');
    setCustomAvatar('');
    setCurrentQuestion(0);
    setScore(0);
    setShowFact(false);
    setFinalScore(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen text-slate-50 font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden bg-[#E2231A]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-600 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-black rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-4">
          <img src="/Illustrated Logo/1.png" alt="ETHMumbai" className="h-14 mx-auto object-contain mb-1" />
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
            <span className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">MAXI-METER</span>
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-slate-900/90 backdrop-blur-xl border-4 border-yellow-400 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-10">
                <Train size={60} className="rotate-12" />
              </div>

              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Train className="text-yellow-400" size={24} />
                Check your status, Bhau!
              </h2>
              <p className="text-slate-400 mb-6 text-sm">Are you a true Mumbai BUIDLer or just a Townie Tourist? 🚉</p>

              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-2 block">
                    X Username or Wallet
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors" size={20} />
                    <input
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="e.g. vitalik.eth"
                      className="w-full bg-slate-800/50 border-2 border-slate-700 p-3 pl-12 rounded-xl focus:border-yellow-400 outline-none transition-all placeholder:text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!handle}
                  className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all hover:-translate-y-0.5 active:translate-y-0 group shadow-[0_8px_20px_-5px_rgba(250,204,21,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  START THE GRIND <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-3"
            >
              <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-full border border-slate-800 px-4">
                <div className="flex gap-1">
                  {QUIZ_DATA.map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= currentQuestion ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">STATION {currentQuestion + 1}</span>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-lg font-bold leading-tight mb-4">{question.q}</h3>

                <div className="grid gap-2">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={showFact}
                      onClick={() => handleAnswer(i)}
                      className={`w-full p-3 text-left text-sm border-2 rounded-lg transition-all font-medium flex justify-between items-center group
                        ${showFact
                          ? i === question.correct
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-slate-800 text-slate-600'
                          : 'border-slate-800 hover:border-blue-500 hover:bg-blue-500/5'
                        }`}
                    >
                      {opt}
                      {!showFact && <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-blue-500" />}
                      {showFact && i === question.correct && <CheckCircle2 size={18} />}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showFact && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-4 bg-yellow-400 text-black p-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex items-start gap-2">
                        {lastAnswerCorrect ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
                        <div>
                          <p className="font-black uppercase tracking-tighter text-sm leading-none mb-1">
                            {lastAnswerCorrect ? "Shabaash! Ek Number!" : "Ae Yedya! Shantat Ghya!"}
                          </p>
                          <p className="text-xs font-bold leading-snug">{question.fact}</p>
                        </div>
                      </div>

                      <button
                        onClick={nextStep}
                        className="mt-3 w-full bg-black text-white p-2 rounded-md font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        {isLastQuestion ? "VIEW FINAL SCORE" : "NEXT STATION"} <ChevronRight size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />

              <ProfileCard
                avatarUrl={avatarUrl}
                name={handle}
                title={getRank(finalScore).title}
                handle={handle}
                status={`Score: ${finalScore}/100`}
                contactText="Share"
                showUserInfo
                enableTilt
                behindGlowColor="rgba(250, 204, 21, 0.5)"
                innerGradient="linear-gradient(145deg, #E2231A44 0%, #FFD60044 100%)"
                onContactClick={shareResult}
              />

              <div className="flex items-center justify-center gap-3">
                {!customAvatar ? (
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-slate-800 transition-all text-sm"
                  >
                    <ImagePlus size={18} className="text-yellow-400" />
                    <span className="text-slate-300">Upload your photo</span>
                  </label>
                ) : (
                  <button
                    onClick={removeImage}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-red-400 hover:bg-slate-800 transition-all text-sm"
                  >
                    <X size={18} className="text-red-400" />
                    <span className="text-slate-300">Remove photo</span>
                  </button>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={shareResult}
                  className="bg-sky-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-sky-400 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
                >
                  SHARE ON X
                </button>
                <button
                  onClick={reset}
                  className="bg-slate-800 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-slate-700 text-sm"
                >
                  <RotateCcw size={16} /> TRY AGAIN
                </button>
              </div>

              <a
                href="https://ethmumbai.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 text-xs font-bold uppercase tracking-widest hover:text-yellow-400 transition-colors inline-flex items-center gap-1"
              >
                Built for ETHMumbai 2025 <ExternalLink size={12} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
