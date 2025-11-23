const API_URL = "https://employee-login-fs5m.onrender.com/auth";

export async function apiRequest(endpoint: string, method = "POST", body?: any) {
  const url = endpoint.startsWith("/") ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (err: any) {
    console.error("API REQUEST FAILED:", err);
    throw new Error(err.message || "API request failed");
  }
}
