import Card from "./Card"

export default function BattleBox() {
  return (
    <div className="flex-grow h-full bg-gray-200 p-4 rounded mb-4">
      <div className="text-center font-bold">QUOTE</div>
      <div className="flex justify-center mt-4 items-center">
        <Card name="Gasser" />
        <div className="font-bold">VS</div>
        <Card name="Heeb" />
      </div>
    </div>
  );
}
