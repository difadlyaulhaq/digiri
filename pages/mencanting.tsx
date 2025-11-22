import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Award, Star, Volume2, VolumeX, Clock, Droplets, Target, Undo, Book, History, Sparkles } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MencantingGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inkLeft, setInkLeft] = useState(100);
  const [timeLeft, setTimeLeft] = useState(300);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'usage' | 'history'>('philosophy');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternImgRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [patternLoaded, setPatternLoaded] = useState(false);
  const lastInkReductionRef = useRef(0);
  const drawingHistoryRef = useRef<ImageData[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const batikPatterns = [
    {
      id: "batik-kawung",
      name: "Batik Tulis Motif Kawung",
      description: "Motif klasik geometris berbentuk bulatan lonjong yang disusun rapi, melambangkan kebijaksanaan dan pengendalian diri.",
      philosophy: "Terinspirasi dari buah aren (kolang-kaling) yang melambangkan manusia yang berguna dari lahir hingga akhir. Empat sisi yang bertemu di satu titik pusat (Papat Kiblat Lima Pancer) bermakna keseimbangan hidup, kesucian hati, dan sifat adil seorang pemimpin sejati.",
      usage: "Sangat cocok untuk acara formal, pertemuan bisnis, atau pakaian kerja karena memancarkan aura wibawa dan profesionalisme.",
      history: "Dahulu merupakan salah satu 'Batik Larangan' (Forbidden Pattern) di Keraton Yogyakarta yang hanya boleh dikenakan oleh Sultan dan kerabat inti kerajaan.",
      image: "/kawung-patern.png",
      targetScore: 70,
      timeLimit: 300,
      inkLimit: 100
    },
    {
      id: "batik-parang",
      name: "Batik Tulis Motif Parang",
      description: "Motif garis diagonal tegas menyerupai huruf 'S' yang saling menjalin, melambangkan kekuatan dan semangat pantang menyerah.",
      philosophy: "Berasal dari kata 'Pereng' (tebing/lereng) atau ombak samudra. Melambangkan semangat yang tidak pernah padam ibarat ombak yang menghantam karang. Garis diagonalnya melambangkan ketangkasan, kewaspadaan, dan keinginan untuk terus memperbaiki diri.",
      usage: "Cocok untuk acara kenegaraan, pembukaan bisnis, atau momen yang membutuhkan ketegasan karakter. Memberikan kesan dinamis dan kuat pada pemakainya.",
      history: "Salah satu motif tertua di Jawa yang diciptakan oleh pendiri Keraton Mataram. Dulu motif Parang Rusak adalah motif khusus untuk para ksatria dan raja, rakyat jelata dilarang memakainya.",
      image: "/parang-patern.jpg",
      targetScore: 75,
      timeLimit: 360,
      inkLimit: 100
    },
    {
      id: "batik-truntum",
      name: "Batik Tulis Motif Truntum",
      description: "Motif bertabur kembang kecil menyerupai bintang atau melati di langit malam, melambangkan cinta yang tulus dan bersemi kembali.",
      philosophy: "Berasal dari kata 'Tumaruntum' yang berarti tumbuh atau bersemi. Melambangkan cinta kasih orang tua yang tulus tanpa syarat kepada anaknya, serta harapan agar kehidupan pengantin baru selalu dituntun ke arah kebaikan.",
      usage: "Wajib digunakan pada acara pernikahan, khususnya dipakai oleh Orang Tua pengantin saat prosesi midodareni atau panggih.",
      history: "Diciptakan oleh Kanjeng Ratu Kencana (Permaisuri Sunan Pakubuwono III) dari Surakarta. Konon motif ini dibuat saat Ratu menatap bintang di langit kelam, sebagai simbol cintanya yang kembali bersemi kepada Raja.",
      image: "/truntum-patern.jpg",
      targetScore: 80,
      timeLimit: 420,
      inkLimit: 100
    }
  ];

  const currentLevel = batikPatterns[level - 1];

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/gamelan-kebogiri.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Music control
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  // Load pattern image
  useEffect(() => {
    const img = new Image();
    img.src = currentLevel.image;
    img.onload = () => {
      patternImgRef.current = img;
      setPatternLoaded(true);
      initializeCanvas();
    };
    img.onerror = () => {
      console.error('Failed to load pattern image');
      setPatternLoaded(true);
      initializeCanvas();
    };
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    if (patternLoaded) {
      initializeCanvas();
    }
  }, [patternLoaded, level]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0 && inkLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'playing' && (timeLeft <= 0 || inkLeft <= 0)) {
      finishGame();
    }

    return () => clearTimeout(timer);
  }, [gameState, timeLeft, inkLeft]);

  // Cursor tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseEnter = () => setCursorVisible(true);
    const handleMouseLeave = () => {
      setCursorVisible(false);
      setIsDrawing(false);
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FEF7E8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (patternImgRef.current) {
      ctx.globalAlpha = 0.2;
      ctx.drawImage(patternImgRef.current, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    drawGridGuide(ctx);
    saveCanvasState();
  };

  const drawGridGuide = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let x = 0; x <= ctx.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= ctx.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawingHistoryRef.current.push(imageData);
  };

  const undoLastStroke = () => {
    if (drawingHistoryRef.current.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawingHistoryRef.current.pop();
    const previousState = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
    ctx.putImageData(previousState, 0, 0);

    setProgress(prev => Math.max(0, prev - 5));
    setInkLeft(prev => Math.min(100, prev + 2));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || inkLeft <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    lastInkReductionRef.current = Date.now();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameState !== 'playing' || inkLeft <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    const now = Date.now();
    if (now - lastInkReductionRef.current > 100) {
      setInkLeft(prev => {
        const newInk = Math.max(0, prev - 0.01);
        lastInkReductionRef.current = now;
        return newInk;
      });
    }
    
    setProgress(prev => Math.min(prev + 0.01, 100));
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveCanvasState();
    }
    setIsDrawing(false);
  };

  const startGame = () => {
    setGameState('playing');
    setProgress(0);
    setScore(0);
    setInkLeft(100);
    setTimeLeft(currentLevel.timeLimit);
    lastInkReductionRef.current = 0;
    drawingHistoryRef.current = [];
    initializeCanvas();
  };

  const finishGame = () => {
    setGameState('finished');
    const baseScore = Math.min(100, Math.floor(progress));
    const inkBonus = Math.floor((inkLeft / 100) * 20);
    const timeBonus = Math.floor((timeLeft / currentLevel.timeLimit) * 10);
    const finalScore = Math.min(100, baseScore + inkBonus + timeBonus);
    setScore(finalScore);
  };

  const resetGame = () => {
    setGameState('idle');
    setProgress(0);
    setScore(0);
    setInkLeft(100);
    setTimeLeft(currentLevel.timeLimit);
    lastInkReductionRef.current = 0;
    drawingHistoryRef.current = [];
    initializeCanvas();
  };

  const nextLevel = () => {
    if (level < 3) {
      setLevel(level + 1);
      resetGame();
    }
  };

  const previousLevel = () => {
    if (level > 1) {
      setLevel(level - 1);
      resetGame();
    }
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'philosophy':
        return currentLevel.philosophy;
      case 'usage':
        return currentLevel.usage;
      case 'history':
        return currentLevel.history;
      default:
        return currentLevel.philosophy;
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'philosophy':
        return <Sparkles size={16} />;
      case 'usage':
        return <Book size={16} />;
      case 'history':
        return <History size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar/>
      <Analytics/>
      
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Target className="w-5 h-5" />
          <span>Game Edukasi</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
          Mencanting Virtual
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Rasakan pengalaman membatik secara digital! Ikuti pola tradisional dan pelajari seni batik tulis.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-t-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
                  <p className="text-blue-200 text-sm mt-1">{currentLevel.description}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Level</p>
                    <p className="text-2xl font-bold">{level}/3</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Skor</p>
                    <p className="text-2xl font-bold">{score}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Bars */}
            <div className="bg-white px-6 py-4 grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-800 font-semibold flex items-center gap-1">
                    <Target size={16} />
                    Progress
                  </span>
                  <span className="text-blue-900 font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <Droplets size={16} />
                    Tinta
                  </span>
                  <span className="text-amber-900 font-bold">{Math.round(inkLeft)}%</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-700 to-amber-800 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${inkLeft}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-800 font-semibold flex items-center gap-1">
                    <Clock size={16} />
                    Waktu
                  </span>
                  <span className="text-green-900 font-bold">{formatTime(timeLeft)}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="bg-white p-6 rounded-b-3xl shadow-2xl">
              <div className="relative bg-blue-50 rounded-2xl overflow-hidden border-4 border-blue-100" style={{ height: '500px' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className={`w-full h-full ${
                    gameState === 'playing' && inkLeft > 0 
                      ? 'cursor-none' 
                      : 'cursor-not-allowed'
                  }`}
                />

                {/* Custom Canting Cursor */}
                {cursorVisible && gameState === 'playing' && inkLeft > 0 && (
                  <div 
                    className="absolute pointer-events-none transition-transform z-50"
                    style={{
                      left: cursorPosition.x + 4,
                      top: cursorPosition.y - 25,
                      transform: isDrawing ? 'scale(0.9) rotate(5deg)' : 'scale(1)'
                    }}
                  >
                    <img 
                      src="/canting.png" 
                      alt="canting"
                      className="w-10 h-14 object-contain drop-shadow-lg"
                    />
                  </div>
                )}

                {/* Warnings */}
                {gameState === 'playing' && inkLeft < 20 && inkLeft > 0 && (
                  <div className="absolute top-4 right-4 bg-red-100 border-2 border-red-400 text-red-800 px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                    ⚠️ Tinta hampir habis!
                  </div>
                )}

                {gameState === 'playing' && timeLeft < 60 && (
                  <div className="absolute top-4 left-4 bg-orange-100 border-2 border-orange-400 text-orange-800 px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-lg">
                    ⏰ Waktu hampir habis!
                  </div>
                )}

                {/* Idle Overlay */}
                {gameState === 'idle' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white p-8 max-w-md">
                      <div className="w-20 h-20 mx-auto mb-6 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-3">Siap Mencanting?</h3>
                      <p className="text-blue-100 mb-2">Gunakan canting virtual untuk mengikuti pola batik</p>
                      <p className="text-blue-200 text-sm mb-6">Tinta sekarang lebih awet! Gambarlah dengan hati-hati.</p>
                      <button
                        onClick={startGame}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-4 rounded-full font-bold hover:shadow-2xl transition transform hover:scale-105 text-lg"
                      >
                        Mulai Mencanting
                      </button>
                    </div>
                  </div>
                )}

                {/* Finished Overlay */}
                {gameState === 'finished' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white p-8 max-w-md">
                      <Award size={64} className="mx-auto mb-4 text-amber-400" />
                      <h3 className="text-3xl font-bold mb-2">Hasil Mencanting</h3>
                      <p className="text-5xl font-bold text-amber-400 mb-6">{score}</p>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-blue-500/30 backdrop-blur p-3 rounded-2xl">
                          <p className="text-blue-100 text-xs">Progress</p>
                          <p className="text-xl font-bold">{Math.round(progress)}%</p>
                        </div>
                        <div className="bg-amber-700/30 backdrop-blur p-3 rounded-2xl">
                          <p className="text-amber-100 text-xs">Tinta</p>
                          <p className="text-xl font-bold">{Math.round(inkLeft)}%</p>
                        </div>
                        <div className="bg-green-500/30 backdrop-blur p-3 rounded-2xl">
                          <p className="text-green-100 text-xs">Waktu</p>
                          <p className="text-xl font-bold">{formatTime(timeLeft)}</p>
                        </div>
                      </div>

                      <p className="text-blue-200 mb-6">
                        {score >= currentLevel.targetScore 
                          ? '🎉 Luar biasa! Hasil cantingan Anda sangat bagus!'
                          : '✨ Bagus! Terus latih keterampilan mencanting Anda!'
                        }
                      </p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={resetGame}
                          className="bg-white text-blue-800 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition flex-1"
                        >
                          Ulangi Level
                        </button>
                        {level < 3 && (
                          <button 
                            onClick={nextLevel}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition flex-1"
                          >
                            Level {level + 1}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-3">
                  <button
                    onClick={undoLastStroke}
                    disabled={drawingHistoryRef.current.length <= 1 || gameState !== 'playing'}
                    className="bg-white border-2 border-slate-300 p-3 rounded-full hover:bg-slate-50 transition disabled:opacity-50"
                    title="Undo"
                  >
                    <Undo size={20} className="text-slate-700" />
                  </button>

                  <button
                    onClick={resetGame}
                    className="bg-white border-2 border-slate-300 p-3 rounded-full hover:bg-slate-50 transition"
                    title="Reset"
                  >
                    <RotateCcw size={20} className="text-slate-700" />
                  </button>
                  
                  <button
                    onClick={toggleMusic}
                    className="bg-white border-2 border-slate-300 p-3 rounded-full hover:bg-slate-50 transition"
                    title="Musik"
                  >
                    {isMusicPlaying ? <Volume2 size={20} className="text-slate-700" /> : <VolumeX size={20} className="text-slate-700" />}
                  </button>

                  {/* Level Navigation */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={previousLevel}
                      disabled={level === 1}
                      className="bg-white text-slate-800 border-2 border-slate-300 px-3 py-2 rounded-full hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ← Prev
                    </button>
                    <span className="text-slate-600 font-medium px-2">Level {level}</span>
                    <button
                      onClick={nextLevel}
                      disabled={level === 3}
                      className="bg-white text-slate-800 border-2 border-slate-300 px-3 py-2 rounded-full hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {gameState === 'playing' && (
                  <button
                    onClick={finishGame}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition flex items-center gap-2"
                  >
                    Selesai Mencanting
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cara Bermain */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Star className="text-amber-600" />
                Cara Bermain
              </h3>
              <div className="space-y-3 text-slate-600 text-sm">
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-800 font-bold">1</span>
                  </div>
                  <p>Klik dan tahan mouse untuk mulai mencanting</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-800 font-bold">2</span>
                  </div>
                  <p>Ikuti pola batik yang terlihat samar di latar belakang</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-800 font-bold">3</span>
                  </div>
                  <p>Gunakan tombol <Undo size={14} className="inline" /> untuk membatalkan goresan terakhir</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-800 font-bold">4</span>
                  </div>
                  <p>Klik "Selesai Mencanting" ketika sudah selesai</p>
                </div>
              </div>
            </div>

            {/* Informasi Motif dengan Tabs */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                <Book size={20} />
                Informasi Motif {currentLevel.name.split(' ').pop()}
              </h3>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4 bg-amber-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('philosophy')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                    activeTab === 'philosophy' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <Sparkles size={14} />
                  Filosofi
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                    activeTab === 'usage' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <Book size={14} />
                  Penggunaan
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition flex-1 justify-center ${
                    activeTab === 'history' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <History size={14} />
                  Sejarah
                </button>
              </div>

              {/* Tab Content */}
              <div className="text-amber-800 text-sm leading-relaxed min-h-[120px]">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 mt-0.5 flex-shrink-0">
                    {getTabIcon()}
                  </div>
                  <p>{getTabContent()}</p>
                </div>
              </div>
            </div>

            {/* Level Info */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-slate-800 mb-4">Level {level}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Motif:</span>
                  <span className="font-semibold text-slate-800">{currentLevel.name.split(' ').pop()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Skor:</span>
                  <span className="font-semibold text-amber-700">{currentLevel.targetScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Waktu:</span>
                  <span className="font-semibold text-green-700">{formatTime(currentLevel.timeLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tinta Awal:</span>
                  <span className="font-semibold text-amber-800">{currentLevel.inkLimit}%</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <span>💡</span>
                Tips Mencanting
              </h3>
              <div className="space-y-2 text-blue-700 text-sm">
                <p>• Gambar dengan gerakan halus dan stabil</p>
                <p>• Ikuti pola dengan teliti</p>
                <p>• Gunakan tombol Undo jika salah</p>
                <p>• Angkat canting saat tidak menggambar untuk menghemat tinta</p>
              </div>
            </div>

            {/* Pencapaian */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Pencapaian</h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-2xl transition ${
                  level >= 1 ? 'bg-blue-50' : 'bg-slate-100 opacity-50'
                }`}>
                  <Award className={level >= 1 ? "text-blue-600" : "text-slate-400"} size={24} />
                  <div>
                    <p className={`font-semibold text-sm ${level >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                      Pemula Batik
                    </p>
                    <p className={`text-xs ${level >= 1 ? 'text-slate-600' : 'text-slate-400'}`}>
                      Selesaikan Level 1
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-2xl transition ${
                  level >= 2 ? 'bg-amber-50' : 'bg-slate-100 opacity-50'
                }`}>
                  <Award className={level >= 2 ? "text-amber-600" : "text-slate-400"} size={24} />
                  <div>
                    <p className={`font-semibold text-sm ${level >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                      Canting Handal
                    </p>
                    <p className={`text-xs ${level >= 2 ? 'text-slate-600' : 'text-slate-400'}`}>
                      Selesaikan Level 2
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-2xl transition ${
                  level >= 3 ? 'bg-green-50' : 'bg-slate-100 opacity-50'
                }`}>
                  <Award className={level >= 3 ? "text-green-600" : "text-slate-400"} size={24} />
                  <div>
                    <p className={`font-semibold text-sm ${level >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                      Ahli Canting
                    </p>
                    <p className={`text-xs ${level >= 3 ? 'text-slate-600' : 'text-slate-400'}`}>
                      Selesaikan semua level
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default MencantingGame;