
import React, { useState, useEffect } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SaveIcon from './icons/SaveIcon';
import Spinner from './Spinner';
import type { GenerationResult } from '../types';

interface ResultsScreenProps {
  results: GenerationResult[];
  onFinish: () => void;
  onDescribeNewStyle: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onFinish, onDescribeNewStyle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aspectRatios, setAspectRatios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!results || results.length === 0) {
      setIsLoading(false);
      return;
    }

    const originals = results.map(r => r.original);

    const calculateRatios = async () => {
      try {
        const ratios = await Promise.all(
          originals.map(originalPhoto => 
            new Promise<string>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(`${img.width} / ${img.height}`);
              img.onerror = (err) => reject(err);
              img.src = originalPhoto;
            })
          )
        );
        setAspectRatios(ratios);
      } catch (error) {
        console.error("Failed to calculate image aspect ratios:", error);
        setAspectRatios(originals.map(() => '3 / 4'));
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateRatios();
  }, [results]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? results.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === results.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleSave = () => {
    if (!results[currentIndex]?.generated) return;
    const link = document.createElement('a');
    link.href = results[currentIndex].generated;
    link.download = `ai-friseur-result-${currentIndex + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900">
        <Spinner />
        <p className="mt-4 text-lg text-gray-300">Preparing your results...</p>
      </div>
    );
  }

  const containerStyle = {
    aspectRatio: aspectRatios[currentIndex] || '3 / 4',
  };

  const currentResult = results[currentIndex];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold">Your New Look!</h1>
      </header>
      
      <main className="flex-grow flex items-center justify-center relative w-full overflow-hidden">
        {results.length > 1 && (
          <>
            <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50">
              <ChevronLeftIcon />
            </button>
            <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50">
              <ChevronRightIcon />
            </button>
          </>
        )}
        
        <div className="w-full h-full flex items-center justify-center p-2">
            <div className="w-full max-w-lg relative" style={containerStyle}>
                {currentResult &&
                    <BeforeAfterSlider key={currentIndex} before={currentResult.original} after={currentResult.generated} />
                }
                <button onClick={handleSave} className="absolute top-2 right-2 z-10 p-2 bg-black/30 text-white rounded-full hover:bg-black/50" title="Save Photo">
                    <SaveIcon />
                </button>
            </div>
        </div>
      </main>
      
      <footer className="p-4 bg-gray-800 flex items-center space-x-4">
        <button onClick={onDescribeNewStyle} className="w-full py-3 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-700">
          Try Another Style
        </button>
        <button onClick={onFinish} className="w-full py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700">
          Finish
        </button>
      </footer>
    </div>
  );
};

export default ResultsScreen;
