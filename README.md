# Vue 3 Chatbot (Vite)

This is a minimal, local-only chatbot UI built with Vue 3 and Vite.

## Features
- Chat UI with message history, typing indicator, and auto-scroll
- Keyboard: Enter to send, Shift+Enter for newline
- Local rule-based bot with simple commands: `help`, `/echo`, `/joke`, `/summary`

## Run locally

Requirements: Node.js 18+

```powershell
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Customize the bot

Edit `src/services/chatbot.js` to change responses or wire a real API. The exported `sendMessage(history, input)` returns a string reply and can be replaced with a network call.

Example stub for a real API:

```js
export async function sendMessage(history, input) {
	const res = await fetch('/api/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ history, input })
	})
	if (!res.ok) throw new Error('API error')
	const data = await res.json()
	return data.reply
}
```

## Build

```powershell
npm run build
npm run preview
```

