# Rwanda Public Service Guide Prototype

A responsive React, TypeScript, and Vite prototype for exploring a citizen-facing guide to common public services in Rwanda. It offers searchable service categories, illustrative service guides, and a sample request tracker.

## Run locally

Requirements: Node.js 18.18+ or 20.0+ and npm.

```bash
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`) when the development server is ready. In Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if script execution policy blocks `npm`.

## Available commands

- `npm run dev` — start the local development server.
- `npm run build` — type-check the app and create a production build in `dist/`.
- `npm run preview` — serve the production build locally.

## Prototype interactions

- Search for services and filter the guide list by category.
- Open a service guide to see example next steps and general preparation guidance.
- Preview an invented request status with the sample reference `DEMO-2026-1042`.
- Use responsive navigation and service guide dialogs on desktop or mobile.

## Important limitations

This is an independent demonstration, not an official Irembo or government website. Service descriptions, process steps, and the sample tracking status are illustrative and may not reflect current official requirements. The app is not connected to government providers and cannot submit applications, accept payments, process documents, or track real requests. Do not enter personal or sensitive information. Verify current requirements and use authorized channels for real services. The prototype has no backend, authentication, or real-data integration.

An operational service would require authorization and service-provider partnerships, validated and regularly maintained guidance, privacy and security controls, accessibility testing, and a supported backend before public launch.
