// Initialize sound effects
const clickSound = new Audio('./sounds/click.mp3');
const revealSound = new Audio('./sounds/reveal.mp3');
const explosionSound = new Audio('./sounds/explosion.mp3');
const winSounds = new Audio('./sounds/win.wav');
// Initialize audio files and handle loading errors
function initializeSounds() {
    [clickSound, revealSound, explosionSound].forEach(sound => {
      sound.preload = 'auto';
      sound.load();
      sound.onerror = () => console.warn(`Failed to load sound: ${sound.src}`);
    });
  }
  
  // Play click sound for cell interactions
  export function playClick() {
    clickSound.currentTime = 0; // Reset to start
    clickSound.play().catch(() => console.warn('Click sound playback failed'));
  }
  
  // Play reveal sound for cell reveals and expansions
  export function playReveal() {
    revealSound.currentTime = 0;
    revealSound.play().catch(() => console.warn('Reveal sound playback failed'));
  }
  
  // Play explosion sound for mine hits
  export function playExplosion() {
    explosionSound.currentTime = 0;
    explosionSound.play().catch(() => console.warn('Explosion sound playback failed'));
  }
  export function playWin() {
    winSounds.currentTime = 0;
    winSounds.play().catch(() => console.warn('Explosion sound playback failed'));
  }
  
  // Initialize sounds when the module loads
  initializeSounds();