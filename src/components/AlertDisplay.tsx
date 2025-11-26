import { useEffect } from 'react';
import type { Alert } from '../types';
import { useAuthStore } from '../store/authStore';
import '../styles/AlertDisplay.css';

interface AlertDisplayProps {
  alert: Alert;
  onDismiss: () => void;
}

export function AlertDisplay({ alert, onDismiss }: AlertDisplayProps) {
  const { settings } = useAuthStore();

  useEffect(() => {
    if (!alert) return;

    if (settings?.alertSoundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = alert.severity === 'critical' ? 1000 : 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }

    if (settings?.alertHapticsEnabled && 'vibrate' in navigator) {
      const pattern = alert.severity === 'critical' ? [200, 100, 200] : [100, 50, 100];
      navigator.vibrate(pattern);
    }

    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [alert, settings]);

  return (
    <div className={`alert-display alert-${alert.severity}`}>
      <div className="alert-content">
        <div className="alert-icon">{alert.severity === 'critical' ? '⚠️' : 'ℹ️'}</div>
        <div className="alert-text">
          <h3 className="alert-title">{alert.title}</h3>
          <p className="alert-message">{alert.message}</p>
        </div>
      </div>
      <button className="alert-close" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
