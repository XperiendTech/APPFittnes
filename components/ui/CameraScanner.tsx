
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from './Button';

interface CameraScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Prioritize rear camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setError('Tu navegador no soporta el acceso a la cámara.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo acceder a la cámara. Revisa los permisos en tu navegador.');
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg');
        onCapture(base64Image);
        stopCamera();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-lg bg-brand-dark p-4 rounded-lg">
        <h3 className="text-xl font-bold text-center text-brand-primary mb-2">Escanear Etiqueta</h3>
        <p className="text-center text-gray-400 mb-4">Apunta con la cámara a la tabla nutricional del producto.</p>
        
        {error ? (
          <div className="text-red-400 bg-red-900/50 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
             <div className="absolute inset-0 border-4 border-dashed border-brand-primary/50 m-4 rounded-lg"></div>
          </div>
        )}
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Button onClick={onClose} variant="secondary" className="w-full">Cancelar</Button>
          <Button onClick={handleCapture} disabled={!!error} className="w-full">Capturar</Button>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
