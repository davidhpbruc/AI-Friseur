import React, { useState } from 'react';
import BackArrowIcon from './icons/BackArrowIcon';
import CloseIcon from './icons/CloseIcon';
import { MimeType, StyleInput } from '../types';
import Spinner from './Spinner';
import { validateStyleImage } from '../services/geminiService';

interface DescribeStyleScreenProps {
  onGenerate: (style: StyleInput) => void;
  onSuggest: () => Promise<string>;
  onBack: () => void;
  takes: number;
  error: string | null;
  initialStyleInput: StyleInput;
}

const MIN_TEXT_WORDS = 5;

const DescribeStyleScreen: React.FC<DescribeStyleScreenProps> = ({ onGenerate, onSuggest, onBack, takes, error, initialStyleInput }) => {
  const [text, setText] = useState(initialStyleInput.text || '');
  const [image, setImage] = useState(initialStyleInput.image || null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isImageValidating, setIsImageValidating] = useState(false);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(null);
    setImageValidationError(null);
    setIsImageValidating(true);

    try {
      const mimeType = file.type as MimeType;
      if (!Object.values(MimeType).includes(mimeType)) {
        setImageValidationError('Unsupported file type. Please use PNG, JPEG, or WEBP.');
        return;
      }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      const validation = await validateStyleImage(base64);
      if (validation.isValid) {
        setImage({ base64, mimeType });
      } else {
        setImageValidationError(validation.issue);
      }
    } catch (err) {
      console.error(err);
      setImageValidationError('An error occurred during image validation.');
    } finally {
      setIsImageValidating(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageValidationError(null);
    const input = document.getElementById('style-photo-upload') as HTMLInputElement;
    if (input) input.value = '';
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
  
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isTextInvalid = wordCount < MIN_TEXT_WORDS;
  
  const isGenerateDisabled = 
    isTextInvalid || 
    takes <= 0 || 
    isImageValidating || 
    !!imageValidationError;

  const isTextPresentButInvalid = text.trim().length > 0 && isTextInvalid;

  return (
    <div className="flex flex-col h-full bg-gray-900 p-4">
      <header className="flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/20">
          <BackArrowIcon />
        </button>
        <h1 className="text-2xl font-bold ml-2">Describe Your Style</h1>
      </header>

      <main className="flex-grow flex flex-col justify-center mt-4">
        {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-left whitespace-pre-wrap">{error}</p>}
        
        <div className="relative mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`e.g., 'a short pixie cut, platinum blonde'.\nYour description is required (min. ${MIN_TEXT_WORDS} words).`}
            className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          />
        </div>
        {isTextPresentButInvalid && (
          <p className="text-yellow-500 text-sm text-center -mt-2 mb-2">
            Please provide a more detailed description (at least {MIN_TEXT_WORDS} words).
          </p>
        )}
        
        <div className="flex flex-col items-center mb-4">
          <label className="w-full px-4 py-3 bg-gray-800 text-center rounded-lg cursor-pointer hover:bg-gray-700">
            <span className="text-purple-400 font-semibold">Upload Style Photo (Optional)</span>
            <input id="style-photo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {isImageValidating && (
            <div className="mt-4 flex flex-col items-center">
              <Spinner small />
              <p className="text-sm text-gray-400 mt-2">Analyzing style image...</p>
            </div>
          )}
          {image && !isImageValidating && (
            <div className="relative mt-4">
              <img src={image.base64} alt="Style preview" className="rounded-lg max-h-32" />
              <button 
                onClick={handleRemoveImage} 
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label="Remove image"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {imageValidationError && !isImageValidating && (
            <p className="text-red-400 text-sm mt-2 text-center">{imageValidationError}</p>
          )}
        </div>

        <button onClick={handleSuggest} disabled={isLoadingSuggestion} className="w-full px-4 py-3 bg-gray-800 text-center rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-wait">
          {isLoadingSuggestion ? <Spinner small /> : <span className="text-purple-400 font-semibold">Suggest a Style For Me</span>}
        </button>
      </main>

      <footer className="py-4">
         <p className="text-center text-gray-400 mb-2">Previews Remaining: <span className="font-bold text-white">{takes}</span></p>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full py-4 bg-purple-600 text-white font-bold rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700"
        >
          Generate New Look
        </button>
      </footer>
    </div>
  );
};

export default DescribeStyleScreen;