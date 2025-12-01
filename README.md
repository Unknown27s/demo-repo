# English Speaking Partner (SpeakEng)

A PWA + Capacitor English-Speaking Partner App that helps users practice English through voice conversations with an AI tutor.

## Features

### Core Features
- **Voice Conversation Loop**: Speak using the microphone, AI responds with voice
- **Speech-to-Text**: Browser Web Speech API
- **Text-to-Speech**: Browser SpeechSynthesis API
- **AI Integration**: Groq API with Llama 3.1 (free tier)
- **Chat UI**: Clean interface with message bubbles, dark/light mode

### AI Tutor Personality
- Friendly and conversational
- Acts like a native English speaker
- Gently corrects grammar mistakes
- Provides improved versions of sentences
- Encourages speaking more
- Asks follow-up questions

### Progress Tracking
- Daily streak counter
- Minutes spoken tracker
- Words learned counter
- Total sessions count

### Conversation Modes
- Daily Life conversations
- Job Interview practice
- Travel scenarios
- Customer Service interactions
- Accent Practice

### Additional Features
- Vocabulary Builder
- Offline support (PWA)
- AdSense (PWA) / AdMob (Android) integration
- Dark/Light theme

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **PWA**: vite-plugin-pwa + Workbox
- **Mobile**: Capacitor (Android)
- **AI**: Groq API (Llama 3.1)
- **Storage**: IndexedDB (idb)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Or enter the API key in the app settings.

## Android Build (Capacitor)

```bash
# Build the web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to native project
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Project Structure

```
src/
├── components/         # React components
│   ├── ApiKeyPrompt.tsx
│   ├── ChatArea.tsx
│   ├── Header.tsx
│   ├── MessageBubble.tsx
│   ├── ModesSelector.tsx
│   ├── ProgressBar.tsx
│   ├── SettingsPanel.tsx
│   ├── TypingIndicator.tsx
│   ├── VocabularyBuilder.tsx
│   └── VoiceButton.tsx
├── contexts/           # React contexts
│   └── AppContext.tsx
├── services/           # API and service modules
│   ├── adService.ts
│   ├── database.ts
│   ├── groqService.ts
│   └── speechService.ts
├── types/              # TypeScript types
│   ├── index.ts
│   └── speech.d.ts
├── utils/              # Utility functions
│   └── conversationModes.ts
├── App.tsx
├── App.css
├── index.css
├── main.tsx
└── vite-env.d.ts
```

## Configuration Files

- `vite.config.ts` - Vite configuration with PWA plugin
- `capacitor.config.ts` - Capacitor configuration for Android
- `tsconfig.json` - TypeScript configuration

## AdSense / AdMob Integration

### AdSense (PWA)
Uncomment the AdSense script in `index.html` and replace with your publisher ID.

### AdMob (Android)
The AdMob plugin is configured in `src/services/adService.ts`. Replace test IDs with your actual AdMob unit IDs for production.

## Privacy & GDPR

The app includes consent handling for personalized ads. Make sure to add a privacy policy before publishing.

## License

MIT
