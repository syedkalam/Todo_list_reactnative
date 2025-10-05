# Secure Todo (React Native)

A small secure todo app built with React Native + Expo. Todos are stored in secure storage and the app requires device authentication (biometric or PIN) before the first modifying operation (add/update/delete) in a session.

This project has been migrated from a React Context-based implementation to Redux Toolkit for clearer state management.

## Features

- Add, edit, delete todos
- Secure persistence using `expo-secure-store`
- Device authentication (biometric / PIN) prompted once per app session before modifying operations
- Simple UI with rounded todo cards and a compact input bar
- Lightweight unit tests for core behavior

## Files of interest

- `App.tsx` — app bootstrap and Redux provider
- `src/store/todosSlice.ts` — Redux slice for todos (actions: add, update, remove, load)
- `src/store/store.ts` — redux store configuration
- `src/services/storage.ts` — secure store wrapper (save/load/clear)
- `src/services/auth.ts` — wrapper around `expo-local-authentication`
- `src/services/session.ts` — session-level auth helper (ensureSessionAuth)
- `src/components/addTodo` — input component
- `src/components/todoItem` — single todo row component
- `src/screens/HomeScreen.*` — main UI and session controls

## Getting started

Requirements:

- Node.js (>=16 recommended)
- npm or yarn
- Expo CLI (if running on emulator/device)

Install dependencies:

```bash
npm install
# or
yarn
```

Run the app (Expo):

```bash
npm run start
# or
expo start
```

Then open on Android/iOS simulator or the Expo Go app.

## Tests

Run Jest tests:

```bash
npm test
```

- `__tests__/todos.slice.test.ts` — basic add/remove reducer test
- `__tests__/addTodo.test.tsx` — integration-style render + interaction test for `AddTodo`

## Authentication model

- The app prompts device-level authentication (biometric or device PIN/fallback) before the first modifying action in an app session.
- Once the session is authenticated the app will not prompt again until the session is cleared by pressing "Lock app (Logout)".
- The Unlock button on the top-right proactively triggers the auth prompt.

This design intentionally balances security with convenience for short-lived tasks.

## Persistence

Todos are serialized to JSON and saved into secure storage via `expo-secure-store` under a single key. On app start, persisted todos are loaded into Redux state.
