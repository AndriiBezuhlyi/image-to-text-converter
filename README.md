# Image to Text Converter

A small Angular application that extracts text from an uploaded image using an external OCR API. Built as an internship test assignment while learning Angular and TypeScript.

## Features

- Upload a JPEG or PNG image up to 2 MB (2,000,000 bytes).
- Preview the selected image before recognition.
- Extract text using Image2TextOnline.
- Copy the result to the clipboard or clear the selection.
- Show loading, validation, request error, empty result, and copy feedback messages.
- Disable file selection and duplicate submissions while recognition is running.

## Stack

- Angular 21, TypeScript, signals, and HttpClient
- HTML and CSS
- Node.js with the built-in HTTP server and fetch; no additional backend packages
- Vitest for the existing component tests

The request goes through Angular -> Node.js proxy -> OCR API. The API key stays on the server and is not included in the Angular application.

## Requirements

- Node.js 24.11.1 (the version used during development)
- npm 11.6.2
- An Image2TextOnline API key: [API documentation](https://image2textonline.com/docs)

The provider offers a free API plan. Check its current limits on the [pricing page](https://image2textonline.com/pricing). An account and your own API key are needed to run recognition.

## Setup

From the project root, install dependencies:

```bash
npm ci
```

Copy `.env.example` to `.env`. In PowerShell:

```powershell
Copy-Item .env.example .env
```

If `.env` already exists, edit it instead of copying over it. Set `OCR_API_KEY` to your own key in that file.

Do not commit `.env` or put the key in frontend code. `.env.example` is only a configuration template and must not contain a real key.

## Run locally

Run both commands from the project root in separate terminals.

Start the backend:

```bash
node --env-file=.env server/server.mjs
```

Start Angular:

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

The backend listens on `127.0.0.1:3000`. Angular's development proxy forwards `/api/**` requests to it. To check the connection, open [http://localhost:4200/api/health](http://localhost:4200/api/health); it should return `{"status":"ok"}`.

Restart the backend after changing its code or environment configuration.

## Usage

1. Choose a JPEG or PNG image containing readable text.
2. Check the preview and click **Extract Text**.
3. Read the result and use **Copy Text** to copy it.
4. Use **Clear** to reset the file, preview, result, and messages.

For a quick demo, use a screenshot with clear English text and no personal information. The image is sent to an external service only when recognition is requested.

## Build and tests

```bash
npm run build
npm test -- --watch=false
```

The build output is in `dist/image-to-text-converter`. The two current component tests check application creation and the page title; they do not test the OCR request or clipboard behavior.

Manual checks during development included file validation, preview replacement, real OCR, copying text, clearing the selection, and retrying after restarting an unavailable backend.

## Limitations

- The OCR request currently uses English (`language=eng`).
- Recognition quality depends on the image and provider. Images without text can still produce incorrect characters.
- Validation checks MIME type and size, not the actual file signature. Corrupted image preview errors do not have a dedicated message yet.
- Oversized requests are rejected after the request body has been read; only chunks within the size limit are retained.
- Interrupted incoming uploads do not yet have dedicated server-side error handling.
- Clipboard access depends on browser permissions and a secure context, such as HTTPS or localhost. If copying fails, the result can be selected and copied manually.
- The Angular proxy configuration works only with the development server. The production build needs separate backend hosting and `/api` routing; this repository does not yet include a production deployment configuration.
- The backend currently listens only on localhost and has no authentication or rate limiting. Public deployment needs request limits to protect the API quota.
