// Simple local chatbot service with rule-based responses

const WAIT_MS = 600

const helpText = `I can do a few things locally:
- Say hello or greet you
- Tell the current date and time
- Echo back your message with /echo
- Tell a random joke with /joke
- Provide a summary of our chat with /summary

Try typing: hello, what's the time?, /echo your text`;

const jokes = [
  "Why did the developer go broke? Because he used up all his cache.",
  "I would tell you a UDP joke, but you might not get it.",
  "There are 10 types of people: those who understand binary and those who don't.",
]

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

export async function sendMessage(history, input) {
  // Simulate thinking time
  await delay(WAIT_MS)

  const text = (input || '').trim()
  if (!text) return "I'm here! Type something to chat."

  // Commands
  if (text.toLowerCase() === 'help' || text === '/help') {
    return helpText
  }

  if (text.startsWith('/echo')) {
    return text.slice('/echo'.length).trim() || 'Nothing to echo.'
  }

  if (text === '/joke') {
    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  if (text === '/summary') {
    const last = history.slice(-6)
    const parts = last.map(m => `${m.role === 'user' ? 'You' : 'Bot'}: ${m.content}`)
    return `Recent conversation:\n\n${parts.join('\n')}`
  }

  // Simple intents
  const lower = text.toLowerCase()
  if (/^(hi|hello|hey)\b/.test(lower)) {
    return 'Hello! How can I help you today? Type help to see options.'
  }
  if (/(time|date)\b/.test(lower)) {
    const now = new Date()
    return `It's ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}.`
  }
  if (/(thank|thanks|thx)\b/.test(lower)) {
    return "You're welcome!"
  }

  // Fallback
  return "I'm a local demo bot. I didn't quite get that. Try 'help', '/joke', or '/echo ...'"
}
