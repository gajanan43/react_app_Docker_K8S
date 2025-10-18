<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { sendMessage as localBotSend } from '../services/chatbot.js'

// Reactive state
const messages = ref([
  {
    id: 1,
    role: 'bot',
    content: "Hi! I'm your local chatbot. Ask me anything or type 'help' to see what I can do.",
    ts: new Date().toISOString(),
  },
])
const input = ref('')
const sending = ref(false)
const error = ref('')
const chatRef = ref(null)

const canSend = computed(() => input.value.trim().length > 0 && !sending.value)

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    trySend()
  }
}

async function trySend() {
  const text = input.value.trim()
  if (!text || sending.value) return
  error.value = ''

  // Push user message
  messages.value.push({
    id: Date.now() + Math.random(),
    role: 'user',
    content: text,
    ts: new Date().toISOString(),
  })
  input.value = ''
  await nextTick()
  scrollToBottom()

  // Send to local bot
  sending.value = true
  try {
    const history = messages.value.map(m => ({ role: m.role, content: m.content }))
    const reply = await localBotSend(history, text)
    messages.value.push({
      id: Date.now() + Math.random(),
      role: 'bot',
      content: reply,
      ts: new Date().toISOString(),
    })
  } catch (e) {
    console.error(e)
    error.value = 'Failed to get a response. Please try again.'
  } finally {
    sending.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  const el = chatRef.value
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }
}

// Auto-scroll when messages change
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)
</script>

<template>
  <div class="chatbot">
    <div class="chat-header">
      <div class="title">ChatBot</div>
      <div class="status" :class="{ online: !sending, busy: sending }">
        {{ sending ? 'Thinking…' : 'Online' }}
      </div>
    </div>

    <div ref="chatRef" class="chat-log" aria-live="polite">
      <div
        v-for="m in messages"
        :key="m.id"
        class="message"
        :class="m.role"
      >
        <div class="avatar" :aria-label="m.role === 'user' ? 'You' : 'Bot'">
          {{ m.role === 'user' ? '🧑' : '🤖' }}
        </div>
        <div class="bubble">
          <div class="content">{{ m.content }}</div>
          <div class="meta">{{ new Date(m.ts).toLocaleTimeString() }}</div>
        </div>
      </div>
      <div v-if="sending" class="message bot">
        <div class="avatar">🤖</div>
        <div class="bubble">
          <div class="typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="composer">
      <textarea
        v-model="input"
        :disabled="sending"
        class="input"
        placeholder="Type a message (Shift+Enter for newline)"
        rows="2"
        @keydown="onKeydown"
      ></textarea>
      <button class="send" :disabled="!canSend" @click="trySend">Send</button>
    </div>

    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
  
</template>

<style scoped>
.chatbot {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: 12px;
  width: min(900px, 100%);
  height: 70vh;
  margin: 0 auto;
  background: #1e1e1e;
  color: #eaeaea;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-weight: 700;
}
.status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #2f2f2f;
}
.status.online { background: #1f3b24; color: #9be59b; }
.status.busy { background: #3b2c1f; color: #f0c28d; }

.chat-log {
  overflow-y: auto;
  padding: 8px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
}

.message {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}
.message.user { flex-direction: row-reverse; }

.avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #2a2a2a;
  border-radius: 50%;
}

.bubble {
  max-width: 75%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #222;
  border: 1px solid #333;
}
.message.user .bubble {
  background: #1f2a3a;
  border-color: #2a3a52;
}

.content { white-space: pre-wrap; line-height: 1.35; }
.meta { margin-top: 6px; opacity: 0.6; font-size: 11px; }

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.input {
  resize: none;
  border-radius: 8px;
  border: 1px solid #2f2f2f;
  background: #0f0f0f;
  color: #eaeaea;
  padding: 10px 12px;
}

.send {
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #3a6ff8;
  background: #275ef1;
  color: white;
  font-weight: 600;
}
.send[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ffb4b4;
  margin: 0;
}

/* typing dots */
.typing { display: inline-flex; gap: 6px; align-items: center; }
.typing span {
  width: 6px; height: 6px; border-radius: 50%; background: #ccc;
  display: inline-block; animation: blink 1.2s infinite ease-in-out;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}
</style>
