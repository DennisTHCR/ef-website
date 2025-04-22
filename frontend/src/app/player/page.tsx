'use client';

import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import Card from '@/components/Card';
import Deck from '@/components/Deck';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const cards = [
  {
    name: 'Mathachu',
    imageUrl: '/cards/A.jpeg',
  },
  {
    name: 'Histozard',
    imageUrl: '/cards/B.JPG',
  },
];

export default function PlayerPage() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardSelect = (index: number) => {
    setSelectedIndex(index);
    // You could also trigger a "vote" or load new cards here
  };

  return (
    <main className="p-4">
      <Header />
      <div className="flex gap-6 mt-4">
        <div className="flex-1">
          <div className="flex justify-center items-center gap-10 mb-6">
            {cards.map((card, index) => (
              <Card
                key={card.name}
                name={card.name}
                imageUrl={card.imageUrl}
                onClick={() => handleCardSelect(index)}
                selected={selectedIndex === index}
              />
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="mb-6 px-4 py-2 bg-red-500 text-white rounded"
          >
            EXIT
          </button>

          <Deck />
        </div>
        <Leaderboard />
      </div>
    </main>
  );
}