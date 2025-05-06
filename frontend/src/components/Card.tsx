type CardProps = {
  name: string;
  imageUrl: string;
  quote: string;
  onClick?: () => void;
  selected?: boolean;
};

export default function Card({ name, imageUrl, quote, onClick, selected }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-[400px] h-[500px] bg-white border-2 ${
        selected ? 'border-green-500' : 'border-gray-300'
      } rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform`}
    >
      <div className="p-2 text-center font-semibold">{name}</div>
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-[70%] object-cover"
      />
      <div className="p-2 text-center font-medium text-gray-600">{quote}</div>
    </div>
  );
}