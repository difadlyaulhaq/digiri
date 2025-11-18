// lib/leaderboardService.ts
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  where 
} from 'firebase/firestore';

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  timestamp: any;
}

// Tambah skor ke leaderboard
export const addScoreToLeaderboard = async (name: string, score: number): Promise<void> => {
  try {
    await addDoc(collection(db, 'leaderboard'), {
      name,
      score,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error adding score to leaderboard:', error);
  }
};

// Ambil top scores dari leaderboard
export const getTopScores = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(
      collection(db, 'leaderboard'), 
      orderBy('score', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const scores: LeaderboardEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      } as LeaderboardEntry);
    });
    
    return scores;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};