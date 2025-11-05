
import React from 'react';

interface SpinnerProps {
  small?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ small }) => {
  const size = small ? 'h-6 w-6' : 'h-12 w-12';
  const border = small ? 'border-4' : 'border-8';
  return (
    <div className={`animate-spin rounded-full ${size} ${border} border-t-purple-500 border-r-purple-500 border-b-gray-700 border-l-gray-700`}></div>
  );
};

export default Spinner;
