const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

const STORAGE_KEY = "budgetflow.session";

let refreshPromise = null;

function parseJsonSafely(response) {
  return response.text().then((text) => {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  });
}

function flattenErrors(data) {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  const message = Object.values(data)
    .flat()
    .map((value) => String(value))
    .join(" ");

  return message || "Something went wrong. Please try again.";
}

function createError(message, status = 500, data = null) {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}

export function getStoredSession() {
  try {
    const rawSession = window.localStorage.getItem(STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const session = getStoredSession();
  if (!session?.refresh) {
    throw createError("Your session has expired. Please sign in again.", 401);
  }

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: session.refresh }),
  })
    .then(async (response) => {
      const data = await parseJsonSafely(response);
      if (!response.ok || !data?.access) {
        clearStoredSession();
        throw createError(flattenErrors(data), response.status, data);
      }

      const nextSession = { ...session, access: data.access };
      setStoredSession(nextSession);
      return data.access;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request(path, options = {}, retry = true) {
  const session = getStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.access) {
    headers.Authorization = `Bearer ${session.access}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && retry && session?.refresh) {
    try {
      await refreshAccessToken();
      return request(path, options, false);
    } catch (error) {
      clearStoredSession();
      throw error;
    }
  }

  if (response.status === 204) {
    return null;
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw createError(flattenErrors(data), response.status, data);
  }

  return data;
}

export const authApi = {
  register(payload) {
    return request("/auth/register/", { method: "POST", body: payload }, false);
  },
  login(payload) {
    return request("/auth/login/", { method: "POST", body: payload }, false);
  },
  me() {
    return request("/auth/me/");
  },
  verifyEmail(token) {
    return request(
      "/auth/verify-email/",
      { method: "POST", body: { token } },
      false
    );
  },
  resendVerification() {
    return request("/auth/resend-verification/", { method: "POST", body: {} });
  },
};

export const budgetApi = {
  getDashboard() {
    return request("/dashboard/");
  },
  getCategories() {
    return request("/categories/");
  },
  createCategory(payload) {
    return request("/categories/", { method: "POST", body: payload });
  },
  updateCategory(id, payload) {
    return request(`/categories/${id}/`, { method: "PATCH", body: payload });
  },
  deleteCategory(id) {
    return request(`/categories/${id}/`, { method: "DELETE" });
  },
  getTransactions(limit) {
    const suffix = limit ? `?limit=${limit}` : "";
    return request(`/transactions/${suffix}`);
  },
  createTransaction(payload) {
    return request("/transactions/", { method: "POST", body: payload });
  },
};
