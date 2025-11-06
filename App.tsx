import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PhotoCaptureStep from './components/PhotoCaptureStep';
import DescribeStyleScreen from './components/DescribeStyleScreen';
import ResultsScreen from './components/ResultsScreen';
import Spinner from './components/Spinner';
import DocsViewer from './components/DocsViewer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateHairstyle, suggestStyle, validatePhoto } from './services/geminiService';
import type { AppScreen, UserPhotos, StyleInput } from './types';
import { MimeType } from './types';
import { INITIAL_TAKES } from './constants';

const GENERATION_TIMEOUT_MS = 90000; // 90 seconds for sequential generation

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [takes, setTakes] = useLocalStorage<number>('takes', INITIAL_TAKES);
  const [userPhotos, setUserPhotos] = useState<UserPhotos>({ front: null, side: null, back: null });
  const [generationResults, setGenerationResults] = useState<{ original: string, generated: string }[]>([]);
  const [styleInput, setStyleInput] = useState<StyleInput>({ text: '', image: null });
  const [error, setError] = useState<string | null>(null);
  const [isDocsVisible, setIsDocsVisible] = useState(false);

  useEffect(() => {
    // Pre-cache a clean state for when the user starts a new preview
    if (screen === 'welcome') {
      setUserPhotos({ front: null, side: null, back: null });
      setGenerationResults([]);
      setStyleInput({ text: '', image: null });
      setError(null);
    }
  }, [screen]);

  const handlePhotoConfirm = (photo: string, view: 'front' | 'side' | 'back') => {
    setUserPhotos(prev => ({ ...prev, [view]: photo }));
    if (view === 'front') setScreen('photo-side');
    else if (view === 'side') setScreen('photo-back');
    else if (view === 'back') setScreen('describe');
  };

  const handleSkip = (view: 'side' | 'back') => {
    if (view === 'side') setScreen('photo-back');
    else if (view === 'back') setScreen('describe');
  };

  const handleGenerate = useCallback(async (input: StyleInput) => {
    if (takes <= 0) {
      setError("You're out of previews. Please purchase more to continue.");
      return;
    }
    if (!userPhotos.front) {
      setError("A front-facing photo is required.");
      return;
    }

    setScreen('generating');
    setError(null);
    setTakes(prev => prev - 1);
    setStyleInput(input);
    
    const photosToProcess: { view: 'front' | 'side' | 'back'; photo: string }[] = [];
    if (userPhotos.front) photosToProcess.push({ view: 'front', photo: userPhotos.front });
    if (userPhotos.side) photosToProcess.push({ view: 'side', photo: userPhotos.side });
    if (userPhotos.back) photosToProcess.push({ view: 'back', photo: userPhotos.back });
    
    try {
      // Sequential generation process to ensure consistency
      const generationProcess = async () => {
        const results: { original: string, generated: string }[] = [];
        const context: { front?: string; side?: string; } = {};
        for (const p of photosToProcess) {
            const image = await generateHairstyle(p.photo, p.view, input, context);
            results.push({ original: p.photo, generated: image });
            if (p.view === 'front') context.front = image;
            if (p.view === 'side') context.side = image;
        }
        return results;
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), GENERATION_TIMEOUT_MS)
      );

      const results = await Promise.race([
        generationProcess(),
        timeoutPromise
      ]) as { original: string, generated: string }[];
      
      setGenerationResults(results);
      setScreen('results');
    } catch (e: any) {
      console.error(e);
       if (e.message === 'timeout') {
        setError('The request timed out as the AI is taking too long. Please try again later.');
      } else if (e.message === 'SAFETY_VIOLATION') {
        setError('Your description or reference photo might violate our content policy. Please modify your request and try again.');
      } else {
        setError('An error occurred generating your preview. Please try rephrasing your description or using a different reference photo.');
      }
      setScreen('describe'); // Go back to the describe screen on error
      setTakes(prev => prev + 1); // Refund the take on error
      setGenerationResults([]); // Clear the results on error
    }
  }, [takes, setTakes, userPhotos]);
  
  const handleSuggest = useCallback(async () => {
    if (!userPhotos.front) return '';
    try {
      const suggestion = await suggestStyle(userPhotos.front);
      return suggestion;
    } catch (e) {
      console.error(e);
      setError('Could not generate a suggestion. Please try again.');
      return '';
    }
  }, [userPhotos.front]);

  const handleValidatePhoto = useCallback(async (photo: string, view: 'front' | 'side' | 'back') => {
    try {
      const result = await validatePhoto(photo, view);
      return result;
    } catch(e) {
      console.error(e);
      return { isValid: false, issue: 'Could not validate photo at this time. Please try again.' };
    }
  }, []);

  const goBack = () => {
    if (screen === 'photo-side') setScreen('photo-front');
    else if (screen === 'photo-back') setScreen('photo-side');
    else if (screen === 'describe') setScreen('photo-back');
    else if (screen === 'results') setScreen('describe');
    else setScreen('welcome');
  };

  const handleFinish = () => setScreen('welcome');
  
  const handleDescribeNewStyle = () => setScreen('describe');

  const addTakes = () => {
    setTakes(prev => prev + 5);
    alert('5 previews have been added!');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setScreen('photo-front')} takes={takes} onAddTakes={addTakes} onShowDocs={() => setIsDocsVisible(true)} />;
      case 'photo-front':
        return <PhotoCaptureStep key="photo-front" view="front" onConfirm={(p) => handlePhotoConfirm(p, 'front')} onBack={() => setScreen('welcome')} onValidate={handleValidatePhoto} />;
      case 'photo-side':
        return <PhotoCaptureStep key="photo-side" view="side" onConfirm={(p) => handlePhotoConfirm(p, 'side')} onSkip={() => handleSkip('side')} onBack={goBack} previousPhoto={userPhotos.front} onValidate={handleValidatePhoto} />;
      case 'photo-back':
        return <PhotoCaptureStep key="photo-back" view="back" onConfirm={(p) => handlePhotoConfirm(p, 'back')} onSkip={() => handleSkip('back')} onBack={goBack} previousPhoto={userPhotos.side} onValidate={handleValidatePhoto} />;
      case 'describe':
        return <DescribeStyleScreen onGenerate={handleGenerate} onSuggest={handleSuggest} onBack={goBack} takes={takes} error={error} />;
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
            <Spinner />
            <h2 className="text-2xl font-bold mt-6 text-center">Creating your new look...</h2>
            <p className="text-gray-400 mt-2 text-center">This can take a moment. The AI is working its magic!</p>
          </div>
        );
      case 'results':
        return (
          <ResultsScreen
            results={generationResults}
            onFinish={handleFinish}
            onDescribeNewStyle={handleDescribeNewStyle}
          />
        );
      default:
        return <WelcomeScreen onStart={() => setScreen('photo-front')} takes={takes} onAddTakes={addTakes} onShowDocs={() => setIsDocsVisible(true)} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 font-sans">
      {renderScreen()}
      {isDocsVisible && <DocsViewer onClose={() => setIsDocsVisible(false)} />}
    </div>
  );
}