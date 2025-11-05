import React, { useState } from 'react';
import CameraView from './CameraView';
import BackArrowIcon from './icons/BackArrowIcon';
import Spinner from './Spinner';

interface PhotoCaptureStepProps {
  view: 'front' | 'side' | 'back';
  onConfirm: (photo: string) => void;
  onSkip?: () => void;
  onBack: () => void;
  previousPhoto?: string | null;
  onValidate: (photo: string, view: 'front' | 'side' | 'back') => Promise<{ isValid: boolean; issue: string; }>;
}

const viewPrompts = {
  front: { title: 'Front View', description: 'Center your face in the guide. Ensure good lighting.' },
  side: { title: 'Angled View', description: 'Turn your head slightly to match the guide.' },
  back: { title: 'Back View', description: 'Use the rear camera. Ask a friend for help if needed!' },
};

const PhotoCaptureStep: React.FC<PhotoCaptureStepProps> = ({ view, onConfirm, onSkip, onBack, previousPhoto, onValidate }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCapture = async (imageDataUrl: string) => {
    setValidationError(null);
    setPhoto(imageDataUrl);
    setIsValidating(true);
    try {
      const result = await onValidate(imageDataUrl, view);
      if (!result.isValid) {
        setValidationError(result.issue);
      }
    } catch (e) {
      console.error(e);
      setValidationError("Failed to validate photo. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setValidationError(null);
  };

  const handleConfirm = () => {
    if (photo && !validationError && !isValidating) {
      onConfirm(photo);
    }
  };

  const { title, description } = viewPrompts[view];
  const confirmText = view === 'back' ? 'Confirm & Continue' : 'Confirm & Next';

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="flex items-center justify-between p-4 text-white absolute top-0 left-0 w-full z-10 bg-black bg-opacity-30">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20">
          <BackArrowIcon />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-grow flex items-center justify-center relative">
        {photo ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <img src={photo} alt="Captured preview" className="object-contain max-h-[80%]" />
            {isValidating && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                <Spinner />
                <p className="mt-4 font-semibold">Analyzing photo...</p>
              </div>
            )}
            {validationError && !isValidating && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-2xl font-bold text-red-500 mb-4">Photo Issue Detected</h3>
                <p className="text-lg text-white">{validationError}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <CameraView onCapture={handleCapture} view={view} />
            {previousPhoto && (
                <img 
                    src={previousPhoto} 
                    alt="Previous step" 
                    className="absolute top-20 right-4 w-20 h-20 object-cover rounded-full border-2 border-purple-500 z-20"
                />
            )}
          </>
        )}
      </main>

      <footer className="p-4 flex justify-around items-center bg-gray-900 min-h-[84px]">
        {photo ? (
            validationError ? (
                <button onClick={handleRetake} className="w-full max-w-xs mx-auto py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700">
                    Retake Photo
                </button>
            ) : (
                <>
                    <button onClick={handleRetake} className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-full">
                        Retake
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isValidating}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full disabled:bg-gray-500 disabled:cursor-wait"
                    >
                        {isValidating ? 'Analyzing...' : confirmText}
                    </button>
                </>
            )
        ) : (
          <>
            <div className="w-16">
              {onSkip && (
                <button onClick={onSkip} className="px-4 py-2 text-gray-400 hover:text-white font-semibold">
                  Skip
                </button>
              )}
            </div>
            <div className="w-20 h-20" /> {/* Placeholder for capture button space */}
            <div className="w-16"></div>
          </>
        )}
      </footer>
    </div>
  );
};

export default PhotoCaptureStep;