import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  takes: number;
  onAddTakes: () => void;
  onShowDocs: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, takes, onAddTakes, onShowDocs }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-900">
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Friseur
        </h1>
        <p className="mt-4 text-lg text-gray-300">Visualize your next hairstyle in seconds.</p>
        <button
          onClick={onStart}
          className="mt-8 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          Start Your Preview
        </button>
      </div>
      <div className="pb-8">
        <p className="text-gray-400">Previews Remaining: <span className="font-bold text-white">{takes}</span></p>
         <button onClick={onAddTakes} className="mt-2 text-sm text-purple-400 hover:underline">
            Buy More Previews
        </button>
        <button onClick={onShowDocs} className="mt-4 text-sm text-gray-400 hover:underline">
            View Project Docs
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;