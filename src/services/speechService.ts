export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private speechRate: number = 1;
  private speechPitch: number = 1;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Speech-to-Text methods
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(
    onResult: (text: string) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      onResult(text);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let errorMessage = 'An error occurred during speech recognition';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access was denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'A network error occurred. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
      }
      
      onError(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch {
      this.isListening = false;
      onError('Failed to start speech recognition');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Text-to-Speech methods
  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
  }

  async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = this.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Voices might not be loaded yet
      this.synthesis.onvoiceschanged = () => {
        resolve(this.getVoices());
      };

      // Fallback timeout
      setTimeout(() => {
        resolve(this.getVoices());
      }, 1000);
    });
  }

  setVoice(voiceURI: string): void {
    const voices = this.getVoices();
    this.selectedVoice = voices.find(v => v.voiceURI === voiceURI) || null;
  }

  setSpeechRate(rate: number): void {
    this.speechRate = Math.max(0.5, Math.min(2, rate));
  }

  setSpeechPitch(pitch: number): void {
    this.speechPitch = Math.max(0.5, Math.min(2, pitch));
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.isSynthesisSupported()) {
      console.warn('Speech synthesis is not supported');
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;
    utterance.lang = 'en-US';

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    } else {
      // Try to select a good English voice
      const voices = this.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      onEnd?.();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}

// Singleton instance
let speechServiceInstance: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService();
  }
  return speechServiceInstance;
}
