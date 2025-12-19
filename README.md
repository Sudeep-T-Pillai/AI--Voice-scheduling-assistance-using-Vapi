# Voice Scheduling Agent - Vikara AI Assessment

A real-time voice assistant capable of scheduling Google Calendar events and sending confirmation emails.

## 🔗 Project Links
- **Live Demo:** [INSERT YOUR VERCEL URL HERE]
- **Demo Video (Loom):** [INSERT LOOM LINK HERE]

## ⚡ Features
- **Voice Interface:** Built with Vapi.ai for low-latency conversation.
- **Smart Scheduling:** Integrates with Google Calendar API to create real events.
- **Verification:** Double-checks date/time with the user before booking to prevent errors.
- **Confirmation:** Automatically sends an email summary to the user upon success.

## 🛠 Tech Stack
- **Frontend:** Next.js + Vapi Web SDK
- **Backend:** Vercel Serverless Functions (Node.js/Python)
- **Voice Stack:** Vapi (Orchestrator) + Deepgram (Transcriber) + OpenAI (LLM)

## 🚀 How to Run Locally
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with `NEXT_PUBLIC_VAPI_KEY=...`
4. Run `npm run dev` and open `http://localhost:3000`

## 📅 Architecture Note
The agent uses a custom tool definition. When the user confirms the time, Vapi triggers the `bookMeeting` function on my backend, which:
1. Authenticates with Google OAuth2.
2. Creates the Calendar event.
3. Triggers the email confirmation service.