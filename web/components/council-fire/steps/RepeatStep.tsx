import { useState, useRef, useCallback } from 'react';
import type { ContentItem } from '../../../hooks/useSeasonalContent';
import type { Season } from '../../../hooks/useSeasonalContent';

interface Props {
  item: ContentItem;
  onContinue: () => void;
  onSkip: () => void;
  season: Season;
}

export function RepeatStep({ item, onContinue, onSkip, season }: Props) {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [micError, setMicError] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          stream.getTracks().forEach(t => t.stop());
          setRecording(false);
          setRecorded(true);
        }
      }, 5000);
    } catch {
      setMicError(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRecording(false);
    setRecorded(true);
  }, []);

  // If mic unavailable, show skip option
  if (micError) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-sm mb-6" style={{ color: 'var(--cf-text-dim)' }}>
          Microphone unavailable
        </p>
        <button
          onClick={onContinue}
          className="px-6 py-2 rounded-full text-sm"
          style={{ color: 'var(--cf-text)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Show the word to repeat */}
      <h2
        className="lakota-text font-light mb-8"
        style={{ color: 'var(--cf-text)', fontSize: '2.5rem' }}
      >
        {item.lakota}
      </h2>

      {recorded ? (
        // After recording
        <div className="cf-fade-in flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981' }}>
            <svg className="w-8 h-8" fill="#10b981" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <button
            onClick={onContinue}
            className="px-8 py-3 rounded-full text-sm"
            style={{ color: 'var(--cf-text)', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}
          >
            Continue
          </button>
        </div>
      ) : recording ? (
        // While recording
        <div className="flex flex-col items-center">
          <button
            onClick={stopRecording}
            className="cf-record-pulse w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444' }}
          >
            <div className="w-6 h-6 rounded-sm bg-red-500" />
          </button>
          <p className="text-sm" style={{ color: 'var(--cf-text-dim)' }}>Recording...</p>
        </div>
      ) : (
        // Before recording
        <div className="flex flex-col items-center">
          <p className="text-sm mb-6" style={{ color: 'var(--cf-text-muted)' }}>
            {season === 'summer' ? 'Speak the word' : 'Try saying it'}
          </p>
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-105"
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '2px solid rgba(239, 68, 68, 0.4)' }}
          >
            <svg className="w-8 h-8" fill="#ef4444" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          {season !== 'summer' && (
            <button
              onClick={onSkip}
              className="text-xs"
              style={{ color: 'var(--cf-text-dim)' }}
            >
              Skip
            </button>
          )}
        </div>
      )}
    </div>
  );
}
