import React, { useRef, useEffect, useState } from 'react';
import FlipCameraIcon from './icons/FlipCameraIcon';
import CameraIcon from './icons/CameraIcon';
import FrontProfileIcon from './icons/FrontProfileIcon';
import SideProfileIcon from './icons/SideProfileIcon';
import BackProfileIcon from './icons/BackProfileIcon';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  view: 'front' | 'side' | 'back';
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, view }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(view === 'back' ? 'environment' : 'user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    setError(null);

    navigator.mediaDevices.getUserMedia({
        video: { facingMode },
    }).then(newStream => {
        if (isCancelled) {
            newStream.getTracks().forEach((track) => track.stop());
            return;
        }
        stream = newStream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }).catch(err => {
        if (!isCancelled) {
            console.error("Error accessing camera:", err);
            setError("Could not access the camera. Please check permissions.");
        }
    });

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // If using the selfie camera, we need to flip the canvas context to undo the CSS mirroring
        if (facingMode === 'user') {
          context.scale(-1, 1);
          context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
      }
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const renderOverlay = () => {
    switch(view) {
      case 'front':
        return <FrontProfileIcon />;
      case 'side':
        return <SideProfileIcon />;
      case 'back':
        return <BackProfileIcon />;
      default:
        return null;
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      {error && <p className="text-red-500 absolute top-1/2 -translate-y-1/2 z-20 p-4 bg-black/50 rounded-lg">{error}</p>}
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {renderOverlay()}
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-around w-full max-w-xs z-10">
        <div className="w-16"></div> {/* Spacer */}
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white bg-white/30 flex items-center justify-center active:bg-white/50"
          aria-label="Capture photo"
        >
          <CameraIcon />
        </button>
        {view !== 'back' ? (
          <button onClick={handleFlipCamera} className="p-3 rounded-full bg-white/20 text-white" aria-label="Flip camera">
            <FlipCameraIcon />
          </button>
        ) : (
          <div className="w-16"></div> // Keep layout consistent
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;