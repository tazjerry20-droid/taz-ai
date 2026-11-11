const $ = s => document.querySelector(s);
const messagesEl = $("#messages"), welcome = $("#welcome"), form = $("#chatForm"), input = $("#prompt"), sendBtn = $("#sendBtn");
let messages = [], chats = JSON.parse(localStorage.getItem("taz_chats") || "[]"), currentId = Date.now();
let mode = "chat", deferredPrompt = null;

const modes = {
  chat: "You are a helpful general AI assistant.",
  write: "Act as an expert writing assistant. Help draft, rewrite, and improve writing.",
  code: "Act as a senior software engineer. Explain code clearly and provide safe, working examples.",
  study: "Act as a patient tutor. Explain step by step in simple language and adapt to the student's level.",
  ideas: "Act as a practical strategist. Turn ideas into clear, realistic plans."
};

function saveChat() {
  if (!messages.length) return;
  const item = { id: currentId, title: (messages.find(m=>m.role==="user")?.content || "New chat").slice(0,42), messages };
  chats = [item, ...chats.filter(c=>c.id!==currentId)].slice(0,30);
  localStorage.setItem("taz_chats", JSON.stringify(chats));
  renderHistory();
}
function renderHistory() {
  $("#history").innerHTML = "";
  chats.forEach(c => {
    const b = document.createElement("button"); b.className = "history-item"; b.textContent = "• " + c.title;
    b.onclick = () => { currentId=c.id; messages=structuredClone(c.messages); renderMessages(); $("#sidebar").classList.remove("open"); };
    $("#history").append(b);
  });
}
function addMessage(role, content) {
  messages.push({role,content}); renderMessages(); saveChat();
}
function renderMessages() {
  welcome.hidden = messages.length > 0; messagesEl.innerHTML = "";
  messages.forEach(m => {
    const row = document.createElement("div"); row.className = `message ${m.role}`;
    if (m.role === "assistant") { const av=document.createElement("div"); av.className="bubble-avatar"; av.textContent="T"; row.append(av); }
    const bubble=document.createElement("div"); bubble.className="bubble"; bubble.textContent=m.content; row.append(bubble);
    messagesEl.append(row);
  });
  $("#chatArea").scrollTop = $("#chatArea").scrollHeight;
}
async function send(text) {
  const value=(text ?? input.value).trim(); if(!value || sendBtn.disabled) return;
  input.value=""; input.style.height="auto";
  addMessage("user", value);
  sendBtn.disabled=true;
  const typing=document.createElement("div"); typing.className="message assistant"; typing.innerHTML='<div class="bubble-avatar">T</div><div class="bubble typing">TAZ AI is thinking…</div>'; messagesEl.append(typing);
  try {
    const apiMessages = [{role:"system",content:modes[mode]}, ...messages.slice(-20)];
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:apiMessages})});
    const data=await r.json();
    typing.remove();
    if(!r.ok) throw new Error(data.error || "Something went wrong.");
    addMessage("assistant",data.answer);
  } catch(e) {
    typing.remove();
    addMessage("assistant", "⚠️ " + e.message);
  } finally { sendBtn.disabled=false; input.focus(); }
}
form.addEventListener("submit",e=>{e.preventDefault();send();});
input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,170)+"px";});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
document.querySelectorAll(".suggestion").forEach(b=>b.onclick=()=>send(b.dataset.prompt));
$("#newChat").onclick=()=>{messages=[];currentId=Date.now();renderMessages();input.focus();$("#sidebar").classList.remove("open");};
$("#clearBtn").onclick=()=>{messages=[];currentId=Date.now();renderMessages();};
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===b));input.placeholder=`Message TAZ AI · ${b.querySelector("span").textContent}…`;});
async function checkStatus(){try{const r=await fetch("/api/status");const d=await r.json();$("#connection").textContent=d.configured?`AI connected · ${d.model}`:"Setup needed · add API key";$(".status-dot").classList.toggle("online",d.configured);}catch{$("#connection").textContent="Server unavailable";}}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false;});
$("#installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("#installBtn").hidden=true;}};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
renderHistory();renderMessages();checkStatus();