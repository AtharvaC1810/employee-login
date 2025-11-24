const API_URL = "https://employee-login-fs5m.onrender.com/auth";

export async function apiRequest(endpoint: string, method = "POST", body?: any) {
  const url = endpoint.startsWith("/") ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text(); 
  if (!text) throw new Error(`Empty response from backend at ${url}`);

  try {
    return JSON.parse(text); // parse JSON
  } catch {
    throw new Error(`Invalid JSON response from backend: ${text}`);
  }
}
