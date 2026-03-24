import { useRef, useCallback } from 'react';

export const useHeartAudio = () => {
  const audioContextRef = useRef(null);
  const flatlineOscillatorRef = useRef(null);
  const flatlineGainRef = useRef(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playFlatline = useCallback(() => {
    if (isPlayingRef.current) return;
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create flatline sound - continuous low beep
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();

    flatlineOscillatorRef.current = oscillator;
    flatlineGainRef.current = gainNode;
    isPlayingRef.current = true;
  }, [getAudioContext]);

  const stopFlatline = useCallback(() => {
    if (flatlineOscillatorRef.current) {
      flatlineOscillatorRef.current.stop();
      flatlineOscillatorRef.current.disconnect();
      flatlineOscillatorRef.current = null;
    }
    if (flatlineGainRef.current) {
      flatlineGainRef.current.disconnect();
      flatlineGainRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  const playHeartbeat = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playBeat = (time) => {
      // First thump (lub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(60, time);
      gain1.gain.setValueAtTime(0, time);
      gain1.gain.linearRampToValueAtTime(0.4, time + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(time);
      osc1.stop(time + 0.15);

      // Second thump (dub)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(50, time + 0.15);
      gain2.gain.setValueAtTime(0, time + 0.15);
      gain2.gain.linearRampToValueAtTime(0.3, time + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(time + 0.15);
      osc2.stop(time + 0.35);
    };

    // Play continuous heartbeat
    let beatTime = ctx.currentTime;
    const scheduleBeats = () => {
      const now = ctx.currentTime;
      while (beatTime < now + 2) {
        playBeat(beatTime);
        beatTime += 0.8; // ~75 BPM
      }
    };

    scheduleBeats();
    const intervalId = setInterval(scheduleBeats, 1000);

    return () => clearInterval(intervalId);
  }, [getAudioContext]);

  const cleanup = useCallback(() => {
    stopFlatline();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopFlatline]);

  return {
    playFlatline,
    stopFlatline,
    playHeartbeat,
    cleanup
  };
};
