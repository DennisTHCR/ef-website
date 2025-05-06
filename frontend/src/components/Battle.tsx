'use client';
import { useState } from "react";
import Card from "./Card";

export default function BattleBox() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleSelect = (cardName: string) => {
    setSelectedCard(prev => (prev === cardName ? null : cardName));
  };

  const exampleCards = {"card1" :  {teacherName: "Gasser", quote: "Blbl" },
"card2": {teacherName: "Test", quote: "AAAA" }}

  return (
    <div className="flex-grow h-full bg-gray-200 p-4 rounded mb-4">
      <div className="text-center font-bold">BATTLE</div>
      <div className="flex justify-center mt-4 items-center gap-4">
        <Card
          name={exampleCards.card1.teacherName}
          imageUrl="/cards/testa.jpeg"
          quote={exampleCards.card1.quote}
          selected={selectedCard === (exampleCards.card1.teacherName)}
          onClick={() => handleSelect(exampleCards.card1.teacherName)}
        />
        <div className="font-bold">VS</div>
        <Card
          name={exampleCards.card2.teacherName}
          imageUrl="/cards/testb.jpg"
          quote={exampleCards.card2.quote}
          selected={selectedCard === (exampleCards.card2.teacherName)}
          onClick={() => handleSelect(exampleCards.card2.teacherName)}
        />
      </div>
    </div>
  );
}
