export default function ModeControls({ onClick }: { onClick: () => void }) {
    return (
      <div className="flex justify-between items-center my-4">
        <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded">
          CHOOSE MODE
        </button>
        <span className="bg-yellow-400 px-3 py-1 rounded text-sm font-semibold">
          NEW SEASON
        </span>
      </div>
    );
  }