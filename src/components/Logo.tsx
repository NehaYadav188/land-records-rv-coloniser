import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Modern Building/Land Design */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300`}>
        <svg 
          className="text-white" 
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{ width: '65%', height: '65%' }}
        >
          {/* Building/Land Plot Icon */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h2v3H9v-3zM13 14h2v3h-2v-3z" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight`}>
            RV
          </span>
          <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} text-gray-700 font-bold tracking-wide`}>
            Coloniser
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
