const BASE = "http://localhost:8000/api";

function getToken() { return localStorage.getItem("token"); }
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

// Funcionário — seus insights validados
export async function getInsights() {
  const res = await fetch(`${BASE}/insights/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar insights.");
  return res.json();
}

// Psicólogo — todos os insights
export async function getAllInsights() {
  const res = await fetch(`${BASE}/insights/all/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar insights.");
  return res.json();
}

// Psicólogo — criar
export async function createInsight(data) {
  const res = await fetch(`${BASE}/insights/`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar insight.");
  return res.json();
}

// Psicólogo — editar content e/ou status
export async function patchInsight(id, data) {
  const res = await fetch(`${BASE}/insights/${id}/`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar insight.");
  return res.json();
}

// Psicólogo — excluir
export async function deleteInsight(id) {
  const res = await fetch(`${BASE}/insights/${id}/`, {
    method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Erro ao excluir insight.");
}