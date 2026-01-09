import { useSoundContext } from "@/contexts/SoundContext";

type SoundEffect = 'correct' | 'wrong' | 'victory' | 'click' | 'countdown' | 'start' | 'pop';

const SOUND_PATHS: Record<SoundEffect, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  victory: '/sounds/victory.mp3',
  click: '/sounds/click.mp3',
  countdown: '/sounds/countdown.mp3',
  start: '/sounds/start.mp3',
  pop: '/sounds/pop.mp3',
};

export function useSound() {
  const { play, isMuted, toggleMute, volume, setVolume } = useSoundContext();

  const playSound = (effect: SoundEffect) => {
    play(SOUND_PATHS[effect]);
  };

  return {
    play: playSound,
    isMuted,
    toggleMute,
    volume,
    setVolume
  };
}
