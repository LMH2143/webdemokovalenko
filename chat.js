'use strict';
const WEBHOOK_URL = 'https://annie2143.app.n8n.cloud/webhook/253aa325-8ce3-4315-8166-5ddeb14c7d51/chat';
const key = 'kovalenko-chat-v1';
const messages = document.querySelector('#messages');
const input = document.querySelector('#input');
const form = document.querySelector('#form');
const error = document.querySelector('#error');
const send = document.querySelector('#send');
const reset = document.querySelector('#reset');
const suggestions = document.querySelector('#suggestions');
const status = document.querySelector('#status');
const welcome = 'Здравствуйте! Добро пожаловать в Kovalenko 👋 Как к вам обращаться? Что вы ищете: женскую, мужскую, детскую обувь или сумку?';
const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let state;
try { state = JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
if (!state || typeof state.sessionId !== 'string' || !Array.isArray(state.history)) state = { sessionId:newId(), history:[] };
let busy = false;
function save() { try { sessionStorage.setItem(key, JSON.stringify(state)); } catch (_) {} }
function bubble(text, role) {
  const el = document.createElement('div'); el.className = `bubble ${role}`;
  // Render plain text and safe links only: AI replies never become executable HTML.
  const parts = String(text).split(/(https?:\/\/[^\s<>]+)/g);
  parts.forEach(part => { if (/^https?:\/\//.test(part)) { const a = document.createElement('a'); a.href = part; a.textContent = part; a.target = '_blank'; a.rel = 'noopener noreferrer'; el.append(a); } else el.append(document.createTextNode(part)); });
  messages.append(el); messages.scrollTop = messages.scrollHeight; return el;
}
function draw() { messages.replaceChildren(); bubble(welcome,'bot'); state.history.forEach(m => { if (m && typeof m.text === 'string' && ['user','bot'].includes(m.role)) bubble(m.text,m.role); }); suggestions.hidden = state.history.length > 0; }
function getReply(data) { if (typeof data === 'string') return data; if (Array.isArray(data)) return data.map(getReply).filter(Boolean).join('\n'); if (data && typeof data === 'object') { for (const k of ['output','text','response','message']) { if (typeof data[k] === 'string') return data[k]; } if (data.json) return getReply(data.json); } return ''; }
function setBusy(value) { busy = value; send.disabled = reset.disabled = value; suggestions.querySelectorAll('button').forEach(b => b.disabled = value); form.setAttribute('aria-busy',String(value)); status.textContent = value ? 'Печатает ответ…' : 'Виртуальный консультант · Задайте ваш вопрос'; }
async function submit(text) {
  if (busy || !text.trim()) return;
  const message = text.trim().slice(0,4000); error.hidden = true; input.value = ''; suggestions.hidden = true;
  state.history.push({role:'user',text:message}); bubble(message,'user'); save(); setBusy(true);
  const pending = bubble('Одну минуту, обрабатываю ваш запрос…','pending');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(),90000);
  try {
    const res = await fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sendMessage',sessionId:state.sessionId,chatInput:message}),signal:controller.signal});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text(); let data;
    try { data = JSON.parse(raw); } catch (_) { if (raw.trim().startsWith('<')) throw new Error('Неожиданный ответ HTML'); data = raw; }
    const reply = getReply(data); if (!reply.trim()) throw new Error('Ответ без текста');
    pending.remove(); bubble(reply,'bot'); state.history.push({role:'bot',text:reply}); save();
  } catch (err) {
    pending.remove(); error.hidden = false;
    error.textContent = err.name === 'AbortError' ? 'La respuesta está tardando demasiado. Ваше сообщение puede haberse procesado; inténtalo de nuevo en unos momentos.' : 'Не удалось получить ответ. Проверьте подключение к интернету. Если ошибка повторяется, администратору необходимо проверить, что процесс n8n активен и разрешает этот домен (CORS).';
    input.value = message;
  } finally { clearTimeout(timer); setBusy(false); }
}
form.addEventListener('submit',e => { e.preventDefault(); submit(input.value); });
input.addEventListener('keydown',e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(input.value); } });
suggestions.querySelectorAll('button').forEach(b => b.addEventListener('click',() => submit(b.textContent)));
reset.addEventListener('click',() => { if (busy) return; if (state.history.length && !confirm('Начать новый разговор? История в этой вкладке будет удалена.')) return; state = {sessionId:newId(),history:[]}; save(); error.hidden = true; input.value = ''; draw(); input.focus(); });
draw();
