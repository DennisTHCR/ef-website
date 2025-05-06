type CardProps = {
  name: string;
  imageUrl: string;
  onClick?: () => void;
  selected?: boolean;
};

export default function Card({ name, onClick, selected }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-[400px] h-[500px] bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'
        } rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform`}
    >
      <div className="p-2 text-center font-semibold">{name}</div>
    </div>
  );
}
