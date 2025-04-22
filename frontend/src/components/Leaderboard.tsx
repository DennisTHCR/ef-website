'use client';

import { useState, useMemo } from 'react';

const allPlayers = [
  'Player1',
  'Player2',
  'Champion123',
  'LegendKiller',
  'QuizMaster',
  'SpeedyJoe',
  'LearnerX',
];

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(player =>
      player.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <aside className="w-75 bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Leaderboard</h3>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <ul className="space-y-1 max-h-500 overflow-y-auto">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <li key={player} className="bg-gray-200 p-2 rounded">
              {player}
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic">No players found</li>
        )}
      </ul>
    </aside>
  );
}