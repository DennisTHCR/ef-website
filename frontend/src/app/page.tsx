'use client';

import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import Battle from '@/components/Battle';

export default function HomePage() {
  return (
    <main className="p-4 h-screen">
      <Header />
      <div className="flex gap-6 mt-4 h-4/5">
        <Battle />
        <Leaderboard />
      </div>
    </main>
  );
}
