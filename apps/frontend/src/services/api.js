const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUsers: () => request("/catalog/users"),
  getUser: (id) => request(`/catalog/users/${id}`),
  getNegotiations: () => request("/negotiations"),
  getNegotiation: (id) => request(`/negotiations/${id}`),
  createNegotiation: (payload) =>
    request("/negotiations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addComment: (id, content, userId) =>
    request(`/negotiations/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, userId }),
    }),
  acceptNegotiation: (id) =>
    request(`/negotiations/${id}/accept`, {
      method: "PATCH",
    }),
  refuseNegotiation: (id) =>
    request(`/negotiations/${id}/refuse`, {
      method: "PATCH",
    }),
};
