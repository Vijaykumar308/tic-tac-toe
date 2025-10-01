import { useEffect, useRef } from 'react';

const Square = ({ value, onClick, disabled = false }) => {
  const squareRef = useRef(null);
  
  // Add animation when value changes
  useEffect(() => {
    if (value && squareRef.current) {
      squareRef.current.animate(
        [
          { transform: 'scale(0.8)', opacity: 0.5 },
          { transform: 'scale(1.1)', opacity: 0.8 },
          { transform: 'scale(1)', opacity: 1 }
        ],
        {
          duration: 200,
          easing: 'ease-out',
        }
      );
    }
  }, [value]);

  return (
    <button
      ref={squareRef}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
        flex items-center justify-center
        text-4xl font-bold rounded-xl
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-lg
        transition-all duration-200
        ${!disabled ? 'transform hover:scale-105' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${!value && !disabled ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
        ${value === 'X' ? 'text-blue-500' : 'text-pink-500'}
        ${disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
        border-2 border-gray-200 dark:border-gray-600
      `}
    >
      {value}
    </button>
  );
};

export default Square;