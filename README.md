# TAZ AI — Android + Website starter

A responsive Progressive Web App (PWA) with a secure server-side AI connection. The same app works in a desktop/mobile browser and can be installed on Android from Chrome.

## Included
- Responsive dark TAZ AI interface
- Chat UI, starter prompts, writing/coding/study/ideas modes
- Local chat history in the browser
- Server-side API key handling (key is never shipped to the browser)
- OpenAI-compatible chat API adapter
- PWA manifest, service worker and install prompt
- Basic API rate limiting and security headers

## Important honesty about features
This is a working starter project, not a deployed public service or a finished native APK. AI chat works after you configure a provider API key. Provider free tiers and model availability change, and may have limits. Image generation, live web search, speech transcription, and PDF/PPT file generation are not connected in this first version; they need separate provider integrations and, in some cases, paid services or browser/device permissions. The app does not pretend these are active.

## Run locally
1. Install Node.js 20 or newer.
2. Extract this ZIP and open a terminal in the `TAZ_AI` folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your API key to `AI_API_KEY`. The example defaults to Groq's OpenAI-compatible endpoint; check the provider's current model list and free-tier rules before use. You can change `AI_BASE_URL` and `AI_MODEL` for another compatible provider.
6. Run `npm start`.
7. Open `http://localhost:3000`.

Do not share your `.env` file or publish your API key. Never place the key in `public/app.js` or HTML.

## Install on Android
1. Deploy the project to an HTTPS host that supports Node.js.
2. Open the deployed HTTPS website in Chrome on Android.
3. Open Chrome menu (⋮) → **Install app** or **Add to Home screen**.

This installs the PWA. It is not a signed native APK. A native APK can be produced later by wrapping the deployed PWA with a trusted Android packaging workflow.

## Deployment
Deploy the Node.js project to a Node-compatible host. Set `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, and `PORT` as server environment variables in the host dashboard. Use HTTPS. Do not commit `.env`.

## Next integrations
- Image generation: connect an image-generation provider endpoint.
- Web search: connect a search provider and display source links.
- Voice: browser speech recognition / speech synthesis, with language and browser support checks.
- Documents: add server-side PDF/DOCX/PPTX generation and file download routes.
- Accounts and cloud sync: add authentication and a database before storing personal data across devices.

## Privacy
Current chat history is stored in the browser's local storage on that device. There are no user accounts or cloud-synced conversations in this starter.
