'use client';

import Header from '@/components/Header';
import ModeControls from '@/components/ModeControls';
import Deck from '@/components/Deck';
import Leaderboard from '@/components/Leaderboard';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="p-4">
      <Header />
      <div className="flex gap-6 mt-4">
        <div className="flex-1">
          <ModeControls onClick={() => router.push('/player')} />
          <Deck />
        </div>
        <Leaderboard />
      </div>
    </main>
  );
}