import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Trophy, Users, Star, Award, ChevronRight } from 'lucide-react';

// Data pertanyaan kuis
const quizQuestions = [
  {
    id: 1,
    question: "Apa makna filosofi dari motif batik Kawung?",
    options: [
      "Kesempurnaan dan kemurnian",
      "Kekuatan dan keberanian", 
      "Kesejahteraan dan kemakmuran",
      "Keselarasan dan keseimbangan"
    ],
    correctAnswer: 0,
    timeLimit: 30
  },
  {
    id: 2,
    question: "Teknik membatik dengan canting disebut teknik...",
    options: [
      "Batik Tulis",
      "Batik Cap",
      "Batik Printing",
      "Batik Kombinasi"
    ],
    correctAnswer: 0,
    timeLimit: 20
  },
  {
    id: 3,
    question: "Warna sogan pada batik tradisional berasal dari...",
    options: [
      "Kulit pohon soga",
      "Daun jati",
      "Kunyit",
      "Tanah liat"
    ],
    correctAnswer: 0,
    timeLimit: 25
  },
  {
    id: 4,
    question: "Motif batik Parang melambangkan...",
    options: [
      "Kekuatan dan keteguhan",
      "Keindahan alam",
      "Kesuburan tanah",
      "Kecerdasan pikiran"
    ],
    correctAnswer: 0,
    timeLimit: 30
  },
  {
    id: 5,
    question: "Desa Giriloyo dikenal sebagai pusat batik...",
    options: [
      "Batik Tulis Yogyakarta",
      "Batik Cap Pekalongan",
      "Batik Printing Modern",
      "Batik Sunda"
    ],
    correctAnswer: 0,
    timeLimit: 20
  }
];

const KuisGame = () => {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
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
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(quizQuestions[0].timeLimit);
    // Reset player scores
    setPlayers(players.map(p => ({ ...p, score: 0 })));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    
    // Check if answer is correct
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const newScore = score + 100;
      setScore(newScore);
      // Update player score
      setPlayers(players.map(p => 
        p.isYou ? { ...p, score: newScore } : { 
          ...p, 
          score: p.score + Math.floor(Math.random() * 50) + 50 
        }
      ));
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(quizQuestions[currentQuestion + 1].timeLimit);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    setSelectedAnswer(-1); // Mark as no answer
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(quizQuestions[currentQuestion + 1].timeLimit);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 2000);
  };

  const getAnswerStyle = (index: number) => {
    if (selectedAnswer === null) {
      return "bg-white border-2 border-stone-200 hover:border-blue-500 hover:bg-blue-50";
    }
    
    const isCorrect = index === quizQuestions[currentQuestion].correctAnswer;
    const isSelected = index === selectedAnswer;
    
    if (isCorrect) {
      return "bg-green-500 text-white border-green-500";
    } else if (isSelected && !isCorrect) {
      return "bg-red-500 text-white border-red-500";
    } else {
      return "bg-stone-100 text-stone-400 border-stone-100";
    }
  };

  return (
    <>
      <Head>
        <title>Kuis Batik - Desa Wisata Batik Giriloyo</title>
        <meta name="description" content="Uji pengetahuan Anda tentang batik dalam kuis interaktif" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Trophy className="w-5 h-5" />
              <span>Kuis Interaktif</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-stone-800 mb-4">
              Kuis Cerdas Budaya
            </h1>
            <p className="text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto">
              Uji pengetahuan batik Anda dan bersaing dengan pemain lain secara real-time!
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
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-4">
                    Siap Bermain?
                  </h2>
                  
                  <div className="bg-blue-50 rounded-2xl p-6 mb-8">
                    <h3 className="font-bold text-blue-900 mb-3">Aturan Permainan</h3>
                    <ul className="text-left space-y-2 text-blue-800">
                      <li className="flex items-center gap-2">
                        <Star size={16} className="text-blue-600" />
                        <span>5 pertanyaan tentang batik</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        <span>Timer untuk setiap pertanyaan</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Trophy size={16} className="text-blue-600" />
                        <span>100 poin untuk jawaban benar</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-12 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 text-lg"
                  >
                    Mulai Kuis
                  </button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
                        Pertanyaan {currentQuestion + 1}/{quizQuestions.length}
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                        timeLeft > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <Clock size={20} />
                        <span>{timeLeft}s</span>
                      </div>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold">
                      Score: {score}
                    </div>
                  </div>

                  {/* Question */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-8 leading-relaxed">
                    {quizQuestions[currentQuestion].question}
                  </h2>

                  {/* Answers */}
                  <div className="space-y-4">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-6 rounded-2xl transition transform hover:scale-105 disabled:hover:scale-100 ${getAnswerStyle(index)}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === null 
                              ? 'bg-blue-100 text-blue-800' 
                              : index === quizQuestions[currentQuestion].correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-stone-100 text-stone-400'
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

              {gameState === 'finished' && (
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="text-white" size={48} />
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-4">
                    Kuis Selesai!
                  </h2>
                  
                  <div className="bg-amber-50 rounded-2xl p-6 mb-8">
                    <p className="text-4xl font-bold text-amber-700 mb-2">{score} Poin</p>
                    <p className="text-stone-600">
                      {score >= 400 ? 'Luar biasa! Anda benar-benar ahli batik! 🎉' :
                       score >= 300 ? 'Hebat! Pengetahuan batik Anda sangat baik! ✨' :
                       score >= 200 ? 'Bagus! Terus belajar tentang batik! 👍' :
                       'Mari belajar lebih banyak tentang batik bersama-sama! 📚'}
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105"
                    >
                      Main Lagi
                    </button>
                    <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition">
                      Lihat Pembahasan
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 sticky top-8">
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                  <Trophy className="text-amber-600" />
                  Leaderboard
                </h2>
                
                <div className="space-y-3">
                  {players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition ${
                          player.isYou
                            ? 'bg-blue-100 border-2 border-blue-200'
                            : 'bg-stone-50 hover:bg-stone-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-stone-200 text-stone-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${player.isYou ? 'text-blue-800' : 'text-stone-800'}`}>
                            {player.name} {player.isYou && '(Anda)'}
                          </p>
                        </div>
                        <div className="bg-stone-100 px-3 py-1 rounded-full font-bold text-stone-800">
                          {player.score}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 bg-stone-50 rounded-2xl">
                  <h3 className="font-bold text-stone-800 mb-3">Statistik Game</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-600">Pemain Online</p>
                      <p className="font-bold text-stone-800">{players.length}</p>
                    </div>
                    <div>
                      <p className="text-stone-600">Pertanyaan</p>
                      <p className="font-bold text-stone-800">{quizQuestions.length}</p>
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