const BASE = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Credenciais inválidas.");
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE}/users/me/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar usuário.");
  return res.json();
}

export async function submitQuestionnaire(data) {
  const res = await fetch(`${BASE}/questionnaires/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao enviar questionário.");
  return res.json();
}

export async function getQuestionnaireHistory() {
  const res = await fetch(`${BASE}/questionnaires/history/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar histórico.");
  return res.json();
}

export async function getInsights() {
  const res = await fetch(`${BASE}/insights/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar insights.");
  return res.json();
}

export async function createInsight(data) {
  const res = await fetch(`${BASE}/insights/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar insight.");
  return res.json();
}

export async function getDashboard() {
  const res = await fetch(`${BASE}/dashboard/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar dashboard.");
  return res.json();
}

export async function createChatSession() {
  const res = await fetch(`${BASE}/chat/sessions/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao criar sessão de chat.");
  return res.json();
}

export async function getChatSessions() {
  const res = await fetch(`${BASE}/chat/sessions/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar sessões.");
  return res.json();
}

export async function sendChatMessage(sessionId, content) {
  const res = await fetch(`${BASE}/chat/sessions/${sessionId}/messages/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Erro ao enviar mensagem.");
  return res.json(); // { user_message, assistant_message }
}
