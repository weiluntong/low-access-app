# LOW Access - Frontend

Cross-platform authentication UI for League of Winners Access control.

## Overview

This monorepo contains the LOW Access frontend built with:
- **Tauri** - Desktop application
- **Expo** - Web support
- **Tamagui** - Cross-platform UI framework
- **TypeScript** - Type-safe development

## Project Structure

```
frontend/
├── apps/
│   ├── expo/          # Expo web app
│   └── tauri/         # Tauri desktop app
└── packages/
    ├── app/           # Shared application logic
    ├── ui/            # UI components (@low-access/ui)
    └── config/        # Configuration (@low-access/config)
```

## Getting Started

Install dependencies:
```bash
yarn install
```

### Build and Run

Run development server:
```bash
yarn run desktop    # Tauri desktop app
yarn run web        # Expo web app
```

Build for production:
```bash
yarn run build:desktop    # Tauri desktop build
yarn run build:web        # Expo web build
```

### Package Names

- `@low-access/ui` - UI component library
- `@low-access/config` - Shared configuration
- `app` - Application logic and features

## Architecture

Features are organized by functionality, not by layer:
```
packages/app/features/
└── home/
    ├── hooks/
    ├── utils/
    └── screen.tsx
```

## IDE Setup (Optional)

If using a TypeScript-aware editor, create your own `tsconfig.json` at the root for path alias support:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "app/*": ["./packages/app/*"],
      "@low-access/ui/*": ["./packages/ui/*"],
      "@low-access/config/*": ["./packages/config/*"]
    }
  }
}
```

See the [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/tsconfig.json.html) for full configuration options. Builds work without it — TypeScript configuration is purely for IDE support.
