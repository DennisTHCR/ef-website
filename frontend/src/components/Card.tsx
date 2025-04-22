type CardProps = {
    name: string;
    imageUrl: string;
    onClick?: () => void;
    selected?: boolean;
  };
  
  export default function Card({ name, imageUrl, onClick, selected }: CardProps) {
    return (
      <div
        onClick={onClick}
        className={`w-[400px] h-[500px] bg-white border-2 ${
          selected ? 'border-blue-500' : 'border-gray-300'
        } rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-100 object-cover rounded-t-lg"
        />
        <div className="p-2 text-center font-semibold">{name}</div>
      </div>
    );
  }