import React, { useState, useEffect, useRef } from 'react';
import MicIcon from './icons/MicIcon';
import BackArrowIcon from './icons/BackArrowIcon';
import { MimeType, StyleInput } from '../types';
import Spinner from './Spinner';

// FIX: Add type declarations for Web Speech API to fix compilation errors.
interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface DescribeStyleScreenProps {
  onGenerate: (style: StyleInput) => void;
  onSuggest: () => Promise<string>;
  onBack: () => void;
  takes: number;
  error: string | null;
}

const DescribeStyleScreen: React.FC<DescribeStyleScreenProps> = ({ onGenerate, onSuggest, onBack, takes, error }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: MimeType } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        setText(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const mimeType = file.type as MimeType;
        if (Object.values(MimeType).includes(mimeType)) {
          setImage({ base64: reader.result as string, mimeType });
        } else {
            alert('Unsupported file type.');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSuggest = async () => {
    setIsLoadingSuggestion(true);
    const suggestion = await onSuggest();
    setText(suggestion);
    setIsLoadingSuggestion(false);
  }

  const handleGenerate = () => {
    onGenerate({ text, image });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4">
      <header className="flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/20">
          <BackArrowIcon />
        </button>
        <h1 className="text-2xl font-bold ml-2">Describe Your Style</h1>
      </header>

      <main className="flex-grow flex flex-col justify-center mt-4">
        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</p>}
        
        <div className="relative mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'a short pixie cut, platinum blonde' or let us suggest a style for you!"
            className="w-full h-32 p-4 pr-12 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />
          <button onClick={handleMicClick} className={`absolute top-4 right-4 p-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
            <MicIcon />
          </button>
        </div>
        
        <div className="text-center my-2 text-gray-400">OR</div>

        <div className="flex flex-col items-center">
          <label className="w-full px-4 py-3 bg-gray-800 text-center rounded-lg cursor-pointer hover:bg-gray-700">
            <span className="text-purple-400 font-semibold">Upload Style Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {image && <img src={image.base64} alt="Style preview" className="mt-4 rounded-lg max-h-32" />}
        </div>
        
        <div className="text-center my-2 text-gray-400">OR</div>

        <button onClick={handleSuggest} disabled={isLoadingSuggestion} className="w-full px-4 py-3 bg-gray-800 text-center rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait">
          {isLoadingSuggestion ? <Spinner small /> : <span className="text-purple-400 font-semibold">Suggest a Style For Me</span>}
        </button>
      </main>

      <footer className="py-4">
         <p className="text-center text-gray-400 mb-2">Previews Remaining: <span className="font-bold text-white">{takes}</span></p>
        <button
          onClick={handleGenerate}
          disabled={(!text && !image) || takes <= 0}
          className="w-full py-4 bg-purple-600 text-white font-bold rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700"
        >
          Generate My Preview (Uses 1 Take)
        </button>
      </footer>
    </div>
  );
};

export default DescribeStyleScreen;
