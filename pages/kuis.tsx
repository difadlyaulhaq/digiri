import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Trophy, Users, Star, Award, ChevronRight, User } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"

// Data pertanyaan kuis
import quizQuestions from '@/data/quizQuestions';
import { addScoreToLeaderboard, getTopScores, LeaderboardEntry } from '@/lib/leaderboardService';

const KuisGame = () => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished' | 'review' | 'levelComplete'>('lobby');
  const [currentLevel, setCurrentLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Anda', score: 0, isYou: true },
    { id: 2, name: 'Budi', score: 0, isYou: false },
    { id: 3, name: 'Sari', score: 0, isYou: false },
    { id: 4, name: 'Rina', score: 0, isYou: false }
  ]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [levelScores, setLevelScores] = useState({ level1: 0, level2: 0, level3: 0 });

  // Load leaderboard
  useEffect(() => {
    const loadLeaderboard = async () => {
      const topScores = await getTopScores(10);
      setLeaderboard(topScores);
    };
    
    if (gameState === 'lobby' || gameState === 'finished') {
      loadLeaderboard();
    }
  }, [gameState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    if (!playerName.trim()) {
      alert('Masukkan nama Anda terlebih dahulu!');
      return;
    }
    
    setGameState('playing');
    setCurrentLevel('level1');
    setCurrentQuestion(0);
    setScore(0);
    setLevelScores({ level1: 0, level2: 0, level3: 0 });
    setUserAnswers([]);
    setTimeLeft(quizQuestions.level1[0].timeLimit);
    // Reset player scores
    setPlayers(players.map(p => ({ ...p, score: 0 })));
  };

  const startLevel = (level: 'level1' | 'level2' | 'level3') => {
    setCurrentLevel(level);
    setCurrentQuestion(0);
    setTimeLeft(quizQuestions[level][0].timeLimit);
    setSelectedAnswer(null);
    setGameState('playing');
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const newUserAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newUserAnswers);
    
    // Check if answer is correct
    const isCorrect = answerIndex === quizQuestions[currentLevel][currentQuestion].correctAnswer;
    if (isCorrect) {
      const newScore = score + 100;
      const newLevelScore = levelScores[currentLevel] + 100;
      
      setScore(newScore);
      setLevelScores(prev => ({ ...prev, [currentLevel]: newLevelScore }));
      
      // Update player score
      setPlayers(players.map(p => 
        p.isYou ? { ...p, score: newScore } : { 
          ...p, 
          score: p.score + Math.floor(Math.random() * 50) + 50 
        }
      ));
    }

    // Move to next question after delay
    setTimeout(async () => {
      if (currentQuestion < quizQuestions[currentLevel].length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(quizQuestions[currentLevel][currentQuestion + 1].timeLimit);
        setSelectedAnswer(null);
      } else {
        // Check if this is the last level
        if (currentLevel === 'level3') {
          // Simpan score ke leaderboard ketika kuis selesai
          await addScoreToLeaderboard(playerName, score + (isCorrect ? 100 : 0));
          setGameState('finished');
        } else {
          setGameState('levelComplete');
        }
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setSelectedAnswer(-1); // Mark as no answer
    const newUserAnswers = [...userAnswers, -1];
    setUserAnswers(newUserAnswers);
    
    setTimeout(async () => {
      if (currentQuestion < quizQuestions[currentLevel].length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(quizQuestions[currentLevel][currentQuestion + 1].timeLimit);
        setSelectedAnswer(null);
      } else {
        // Check if this is the last level
        if (currentLevel === 'level3') {
          // Simpan score ke leaderboard ketika kuis selesai
          await addScoreToLeaderboard(playerName, score);
          setGameState('finished');
        } else {
          setGameState('levelComplete');
        }
      }
    }, 2000);
  };

  const getAnswerStyle = (index: number) => {
    if (selectedAnswer === null) {
      return "bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50";
    }
    
    const isCorrect = index === quizQuestions[currentLevel][currentQuestion].correctAnswer;
    const isSelected = index === selectedAnswer;
    
    if (isCorrect) {
      return "bg-green-500 text-white border-green-500";
    } else if (isSelected && !isCorrect) {
      return "bg-red-500 text-white border-red-500";
    } else {
      return "bg-slate-100 text-slate-400 border-slate-100";
    }
  };

  const showReview = () => {
    setGameState('review');
  };

  const getCurrentQuestions = () => {
    return [...quizQuestions.level1, ...quizQuestions.level2, ...quizQuestions.level3];
  };

  // Komponen untuk halaman pembahasan
  const ReviewPage = () => {
    const allQuestions = getCurrentQuestions();
    
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Pembahasan Kuis</h2>
        
        <div className="space-y-8">
          {allQuestions.map((question, index) => (
            <div key={question.id} className="border-b-2 border-slate-100 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                  Level {Math.ceil((index + 1) / 5)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {index + 1}. {question.question}
              </h3>
              
              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                  const isCorrect = optIndex === question.correctAnswer;
                  const isUserAnswer = userAnswers[index] === optIndex;
                  
                  let bgColor = "bg-white border-2 border-slate-200";
                  if (isCorrect) {
                    bgColor = "bg-green-100 border-2 border-green-500";
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = "bg-red-100 border-2 border-red-500";
                  }
                  
                  return (
                    <div 
                      key={optIndex}
                      className={`p-4 rounded-2xl ${bgColor} transition`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isCorrect ? 'bg-green-500 text-white' : 
                          isUserAnswer && !isCorrect ? 'bg-red-500 text-white' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className={`font-medium ${
                          isCorrect ? 'text-green-800' : 
                          isUserAnswer && !isCorrect ? 'text-red-800' : 
                          'text-slate-700'
                        }`}>
                          {option}
                          {isCorrect && " ✓"}
                          {isUserAnswer && !isCorrect && " ✗"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-blue-800 font-medium">💡 {question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 mr-4"
          >
            Main Lagi
          </button>
          <button
            onClick={() => setGameState('finished')}
            className="bg-white text-blue-800 border-2 border-blue-800 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition"
          >
            Kembali ke Hasil
          </button>
        </div>
      </div>
    );
  };

  const LevelCompletePage = () => {
    const nextLevel = currentLevel === 'level1' ? 'level2' : 'level3';
    const levelNames = {
      level1: 'Level 1: Proses & Dedikasi',
      level2: 'Level 2: Urgensi & Keaslian', 
      level3: 'Level 3: Apresiasi & Tindakan'
    };

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-white" size={48} />
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
          Level {currentLevel.slice(-1)} Selesai!
        </h2>
        
        <div className="bg-amber-50 rounded-2xl p-6 mb-8">
          <p className="text-2xl font-bold text-amber-700 mb-2">
            {levelScores[currentLevel]} Poin
          </p>
          <p className="text-slate-600 font-medium mb-2">{levelNames[currentLevel]}</p>
          <p className="text-slate-600">
            {levelScores[currentLevel] >= 400 ? 'Luar biasa! ✨' :
             levelScores[currentLevel] >= 300 ? 'Hebat! 👍' :
             'Bagus! Terus belajar! 📚'}
          </p>
        </div>

        {nextLevel === 'level2' && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-2">Selanjutnya: Level 2</h3>
            <p className="text-slate-600">Mari pelajari tentang urgensi melestarikan batik tulis!</p>
          </div>
        )}

        {nextLevel === 'level3' && (
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-2">Selanjutnya: Level 3</h3>
            <p className="text-slate-600">Pelajari bagaimana Anda bisa membantu melestarikan warisan budaya ini!</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => startLevel(nextLevel)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105"
          >
            Lanjut ke Level {nextLevel.slice(-1)}
          </button>
        </div>
      </div>
    );
  };

  const getLevelName = (level: string) => {
    const names = {
      level1: 'Proses & Dedikasi',
      level2: 'Urgensi & Keaslian',
      level3: 'Apresiasi & Tindakan'
    };
    return names[level as keyof typeof names] || level;
  };

  return (
    <>
      <Head>
        <title>Kuis Batik - Desa Wisata Batik Giriloyo</title>
        <meta name="description" content="Uji pengetahuan Anda tentang batik dalam kuis interaktif" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Analytics />
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Trophy className="w-5 h-5" />
              <span>Kuis Interaktif Berlevel</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 mb-4">
              Kuis Cerdas Berbatik
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
              "Menghargai Sang Maha Karya" - Uji pengetahuan batik Anda melalui 3 level tantangan!
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {gameState === 'lobby' && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-blue-600" size={48} />
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
                    Siap Bermain?
                  </h2>

                  {/* Input Nama */}
                  <div className="max-w-md mx-auto mb-8">
                    <label className="block text-slate-400 text-left mb-2 font-medium">
                      Masukkan Nama Anda:
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Nama pemain"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 text-black rounded-2xl focus:border-blue-600 focus:outline-none transition"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-2xl p-6 mb-8">
                    <h3 className="font-bold text-blue-900 mb-4">Tantangan 3 Level</h3>
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">Level 1: Proses & Dedikasi</p>
                          <p className="text-blue-800 text-sm">Pahami mengapa batik tulis berharga premium</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                          2
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Level 2: Urgensi & Keaslian</p>
                          <p className="text-green-800 text-sm">Ketahui mengapa Anda harus peduli</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                          3
                        </div>
                        <div>
                          <p className="font-semibold text-amber-900">Level 3: Apresiasi & Tindakan</p>
                          <p className="text-amber-800 text-sm">Pelajari bagaimana Anda bisa membantu</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-12 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!playerName.trim()}
                  >
                    Mulai Petualangan
                  </button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
                        {getLevelName(currentLevel)} - Soal {currentQuestion + 1}/{quizQuestions[currentLevel].length}
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                        timeLeft > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <Clock size={20} />
                        <span>{timeLeft}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold">
                        Total: {score}
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
                        Level: {levelScores[currentLevel]}
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {quizQuestions[currentLevel][currentQuestion].question}
                  </h2>

                  {/* Answers */}
                  <div className="space-y-4">
                    {quizQuestions[currentLevel][currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-black text-left p-6 rounded-2xl transition transform hover:scale-105 disabled:hover:scale-100 ${getAnswerStyle(index)}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === null 
                              ? 'bg-blue-100 text-blue-800' 
                              : index === quizQuestions[currentLevel][currentQuestion].correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-lg font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameState === 'levelComplete' && <LevelCompletePage />}

              {gameState === 'finished' && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-white" size={48} />
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
                    Selamat, {playerName}!
                  </h2>
                  
                  <div className="bg-amber-50 rounded-2xl p-6 mb-8">
                    <p className="text-4xl font-bold text-amber-700 mb-2">{score} Poin</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Level 1</p>
                        <p className="font-bold text-blue-600">{levelScores.level1}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Level 2</p>
                        <p className="font-bold text-green-600">{levelScores.level2}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Level 3</p>
                        <p className="font-bold text-amber-600">{levelScores.level3}</p>
                      </div>
                    </div>
                    <p className="text-slate-600">
                      {score >= 1200 ? 'Luar biasa! Anda benar-benar ahli batik! 🎉' :
                       score >= 900 ? 'Hebat! Pengetahuan batik Anda sangat baik! ✨' :
                       score >= 600 ? 'Bagus! Terus belajar tentang batik! 👍' :
                       'Mari belajar lebih banyak tentang batik bersama-sama! 📚'}
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105"
                    >
                      Main Lagi
                    </button>
                    <button 
                      onClick={showReview}
                      className="bg-white text-blue-800 border-2 border-blue-800 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition"
                    >
                      Lihat Pembahasan
                    </button>
                  </div>
                </div>
              )}

              {gameState === 'review' && <ReviewPage />}
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Trophy className="text-amber-600" />
                  Leaderboard Global
                </h2>
                
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition ${
                        player.name === playerName 
                          ? 'bg-blue-100 border-2 border-blue-200' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-slate-200 text-slate-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          player.name === playerName ? 'text-blue-800' : 'text-slate-800'
                        }`}>
                          {player.name} {player.name === playerName && '(Anda)'}
                        </p>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-800">
                        {player.score}
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="text-center py-4 text-slate-500">
                      Belum ada data leaderboard
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                  <h3 className="font-bold text-slate-800 mb-3">Statistik Game</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Pemain Online</p>
                      <p className="font-bold text-slate-800">{players.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Total Pertanyaan</p>
                      <p className="font-bold text-slate-800">15</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Level</p>
                      <p className="font-bold text-slate-800">3</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Skor Maksimal</p>
                      <p className="font-bold text-slate-800">1500</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default KuisGame;