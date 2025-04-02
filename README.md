# React Native Starter Pack

A modern, scalable React Native starter template with built-in authentication, state management, and essential tooling.

## 🚀 Features

- **Expo Router (v3)** - File-based routing with type safety
- **State Management**
  - Zustand for global state
  - MMKV and AsyncStorage for persistent storage
  - Type-safe stores with TypeScript
  - Offline-first support with Supabase integration
- **Analytics & Monitoring**
  - PostHog integration for analytics
  - Sentry for error tracking
- **Authentication**
  - Built-in user management
  - Secure token handling
  - Onboarding flow
- **UI Components**
  - Generic, customizable components
  - Responsive layouts
- **Type Safety**
  - Full TypeScript support
  - Type-safe navigation
  - Strict type checking

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- yarn or npm
- iOS Simulator or Android Emulator
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-native-starter.git
```

2. Install dependencies:
```bash
cd react-native-starter
yarn install
```

3. Set up environment variables in .env.local.

4. Build the app:
```bash
npx expo build:android
npx expo build:ios
```

This will start the development server after building the app.

5. Start the development server:
```bash
npx expo start --dev-client
```

## 🏗️ Project Structure

```
react-native-starter/
├── app/                   # Expo Router pages
├── components/            # Reusable components
├── interfaces/            # Zustand stores
│   └── user_profile.ts    # User profile store
|   └── app_state.ts       # App state store
|   └── ...
├── types/                 # TypeScript types
├── utils/                 # Helper functions
├── constants/             # App constants
└── assets/               # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory or use `safe_constants.ts` directly.

```env
POSTHOG_API_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
...
{YOUR_AUTH_PROVIDER_KEYS}
```

### PostHog Setup

1. Create a PostHog account
2. Add your API key to `safe_constants.ts`
3. Initialize in `app/_layout.tsx`

### Sentry Setup

1. Create a Sentry account
2. Add your DSN to `.env` or `.env.local`
3. Add your constants to `safe_constants.ts`
4. Initialize in `app/_layout.tsx`

## 📱 Core Features

### User Management

The starter includes a complete user management system using Zustand and MMKV:

```typescript
const { profile, updateProfile } = useUserProfileStore();

// Update user data
updateProfile({
  firstName: 'John',
  lastName: 'Doe'
});

```

### Navigation

File-based routing with Expo Router:

```typescript
import { Link } from 'expo-router';

// Navigate to settings
<Link href="/settings">Settings</Link>
```

### State Management

Zustand stores with MMKV persistence:

```typescript
// Access user state
const { profile, isLoading } = useUserProfileStore();

// Update preferences
const { updatePreferences } = useUserProfileStore();
updatePreferences({ theme: 'dark' });
```

These Zustand stores also come with offline-first support and custom hooks for ease-of-use.

## 🛠️ Customization

### Theme

Modify `constants/Colors.ts` to customize the app theme:

```typescript
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  // Add your colors
};
```

### Components

Generic components can be customized in the `components` directory:

```typescript
// Example: Customize the Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  // Add your props
}
```

## 🧪 Testing

```bash
# Run tests
npx npm test
```

## 📦 Building for Production

You can follow the EAS docs. If you want to build locally, then:

```bash
# Build for iOS
yarn build:ios

# Build for Android
yarn build:android
```