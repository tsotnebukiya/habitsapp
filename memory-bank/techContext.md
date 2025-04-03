# Technical Context

## Development Environment

### Prerequisites

- Node.js v18 or newer
- yarn or npm
- iOS Simulator or Android Emulator
- Expo CLI

### Core Technologies

1. **React Native & Expo**

   - React Native v0.74.5
   - Expo SDK v51
   - Expo Router v3
   - TypeScript v5.5.4

2. **State Management**

   - Zustand v5.0.1
   - MMKV v2.12.2
   - AsyncStorage v1.23.1

3. **UI Components**
   - React Native Reanimated v3.10.1
   - React Native Gesture Handler v2.16.1
   - React Native Skia v1.2.3
   - Various Expo modules

## Dependencies

### Production Dependencies

```json
{
  "@expo/vector-icons": "^14.0.4",
  "@gorhom/bottom-sheet": "^4.6.3",
  "@supabase/supabase-js": "^2.44.4",
  "expo-router": "^3.5.18",
  "posthog-react-native": "^3.3.9",
  "@sentry/react-native": "^6.1.0",
  "react-native-mmkv": "2.12.2",
  "zustand": "^5.0.1"
}
```

### Development Dependencies

```json
{
  "@babel/core": "^7.24.0",
  "@testing-library/react-native": "^12.9.0",
  "typescript": "^5.5.4",
  "jest": "^29.2.1"
}
```

## External Services

### Analytics & Monitoring

1. **PostHog**

   - Event tracking
   - User analytics
   - Feature flags
   - A/B testing

2. **Sentry**
   - Error tracking
   - Performance monitoring
   - Crash reporting
   - Debug symbols

### Backend Services

1. **Supabase**
   - Database
   - Authentication
   - Real-time subscriptions
   - Storage

## Development Setup

### Installation Steps

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env

# Start development server
yarn dev
```

### Environment Variables

```env
POSTHOG_API_KEY=
SENTRY_DSN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Build & Deployment

### Local Development

```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web
```

### Production Builds

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Testing

### Test Setup

- Jest
- React Native Testing Library
- Mock implementations
- Test utilities

### Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage
```

## Performance Considerations

### Mobile Optimization

1. **Bundle Size**

   - Asset optimization
   - Code splitting
   - Tree shaking
   - Dynamic imports

2. **Runtime Performance**
   - Memory management
   - Animation optimization
   - List virtualization
   - Image caching

### Development Tools

1. **Debugging**

   - React Native Debugger
   - Chrome DevTools
   - Flipper
   - Performance Monitor

2. **Code Quality**
   - ESLint
   - Prettier
   - TypeScript
   - Husky hooks
