const Logo = ({ size = 'md', showText = true, className = '' }) => {
    const sizes = {
      sm: { container: 'w-8 h-8', text: 'text-lg' },
      md: { container: 'w-16 h-16', text: 'text-3xl' },
      lg: { container: 'w-24 h-24', text: 'text-4xl' },
      xl: { container: 'w-32 h-32', text: 'text-5xl' }
    };
  
    const sizeClasses = sizes[size] || sizes.md;
  
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeClasses.container} relative flex-shrink-0`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-lg"
          >
            <circle cx="50" cy="50" r="48" fill="url(#gradient1)" className="drop-shadow-md" />
            <line x1="35" y1="25" x2="35" y2="75" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="65" y1="25" x2="65" y2="75" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="25" y1="35" x2="75" y2="35" stroke="white" strokeWidth="2" opacity="0.3" />
            <line x1="25" y1="65" x2="75" y2="65" stroke="white" strokeWidth="2" opacity="0.3" />
            <g transform="translate(30, 30)">
              <line x1="2" y1="2" x2="13" y2="13" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="13" y1="2" x2="2" y2="13" stroke="#60A5FA" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <circle cx="57.5" cy="57.5" r="7" stroke="#F87171" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {showText && (
          <div className="flex flex-col leading-none">
            <h1 className={`${sizeClasses.text} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              Zero Kata
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">MULTIPLAYER</p>
          </div>
        )}
      </div>
    );
  };
  
  export default Logo;