import Deck from "./Deck";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1 className="text-xl font-bold">TEACHEMONE</h1>
      <Deck />
    </header>
  );
}
