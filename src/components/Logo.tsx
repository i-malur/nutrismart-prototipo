import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = false 
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', svg: 'w-7 h-7', text: 'text-lg' },
    md: { box: 'w-9 h-9 sm:w-10 sm:h-10', svg: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-xl' },
    lg: { box: 'w-12 h-12', svg: 'w-12 h-12', text: 'text-2xl' },
    xl: { box: 'w-16 h-16', svg: 'w-16 h-16', text: 'text-3xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG exato da logo enviada pelo usuário: garfo e colher no círculo com folhinhas */}
      <div className={`relative ${currentSize.box} shrink-0 flex items-center justify-center`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo da tigela/prato estilizado em verde folha (#63D753 / #7bc043) */}
          <path 
            d="M 33 22 C 22 30 18 46 22 62 C 26 77 40 88 56 89 C 63 89 71 86 76 82" 
            stroke="#63D753" 
            strokeWidth="7" 
            strokeLinecap="round" 
          />
          {/* Folha curva lateral direita */}
          <path 
            d="M 66 33 C 60 44 60 58 66 68 C 73 54 75 42 66 33 Z" 
            fill="#63D753" 
          />
          {/* Pequena folha brotando para fora */}
          <path 
            d="M 72 68 C 76 64 85 64 86 67 C 84 72 77 74 72 68 Z" 
            fill="#63D753" 
          />

          {/* Colher inclinada elegante */}
          <g transform="rotate(-14 42 50)">
            {/* Bojo da colher */}
            <path 
              d="M 40 18 C 34 18 30 25 31 34 C 32 41 36 45 39 46 L 39 78 C 39 80 43 80 43 78 L 43 46 C 46 45 50 41 51 34 C 52 25 48 18 42 18 Z" 
              fill="#63D753" 
            />
          </g>

          {/* Garfo inclinado elegante */}
          <g transform="rotate(-14 55 50)">
            {/* Dentes e base do garfo */}
            <path 
              d="M 52 20 L 53.5 35 M 56 20 L 56.5 35 M 60 20 L 59.5 35 M 64 20 L 62.5 35" 
              stroke="#63D753" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
            />
            {/* Corpo e cabo do garfo */}
            <path 
              d="M 52.5 35 C 53 43 56 46 57 48 L 57 78 C 57 80 61 80 61 78 L 61 48 C 62 46 65 43 65.5 35 Z" 
              fill="#63D753" 
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <span className={`font-display font-black tracking-tight text-[#0C6816] ${currentSize.text} leading-none`}>
            nutri<span className="text-[#63D753]">smart</span>
          </span>
          <span className="text-[10px] text-[#5E6B52] font-semibold tracking-wider uppercase mt-0.5">
            Nutrição Inteligente
          </span>
        </div>
      )}
    </div>
  );
};
