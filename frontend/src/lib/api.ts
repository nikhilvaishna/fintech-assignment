// Ensure API_BASE is always a full URL
function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "http://localhost:3001";
  
  // If it starts with http:// or https://, use it as-is
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl.replace(/\/+$/, ""); // Remove trailing slashes
  }
  
  // If it doesn't have a protocol, assume https:// in production
  const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https://" : "http://";
  return `${protocol}${envUrl.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

const API_BASE = getApiBase();

export type User = { id: string; email: string; name: string | null };

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TasksResponse = {
  tasks: Task[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function setStoredTokens(access: string, refresh?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}

function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("user");
    return s ? (JSON.parse(s) as User) : null;
  } catch {
    return null;
  }
}

function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const refresh = getStoredRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      credentials: "include",
    });
    if (!res.ok) {
      clearStoredTokens();
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message ?? "Session expired");
    }
    const data: AuthResponse = await res.json();
    setStoredTokens(data.accessToken, data.refreshToken ?? undefined);
    setStoredUser(data.user);
    return data.accessToken;
  })();
  try {
    const token = await refreshPromise;
    return token;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  let token = getStoredAccessToken();

  const doRequest = (accessToken: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };
    if (accessToken && !skipAuth) (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    return fetch(url, { ...init, headers, credentials: "include" });
  };

  let res = doRequest(token);

  if (!skipAuth && token && (await res).status === 401) {
    try {
      token = await refreshAccessToken();
      res = doRequest(token);
    } catch {
      throw new Error("Session expired");
    }
  }

  const response = await res;
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message ?? data.error ?? "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export const authApi = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    setStoredTokens(data.accessToken, data.refreshToken ?? undefined);
    setStoredUser(data.user);
    return data;
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setStoredTokens(data.accessToken, data.refreshToken ?? undefined);
    setStoredUser(data.user);
    return data;
  },
  async logout(): Promise<void> {
    const refresh = getStoredRefreshToken();
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: refresh ? JSON.stringify({ refreshToken: refresh }) : undefined,
      });
    } finally {
      clearStoredTokens();
    }
  },
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  clearStoredTokens,
};

export const tasksApi = {
  list(params: { page?: number; limit?: number; status?: string; search?: string }): Promise<TasksResponse> {
    const sp = new URLSearchParams();
    if (params.page != null) sp.set("page", String(params.page));
    if (params.limit != null) sp.set("limit", String(params.limit));
    if (params.status) sp.set("status", params.status);
    if (params.search) sp.set("search", params.search);
    return apiRequest(`/tasks?${sp.toString()}`);
  },
  get(id: string): Promise<Task> {
    return apiRequest(`/tasks/${id}`);
  },
  create(body: { title: string; description?: string; status?: string }): Promise<Task> {
    return apiRequest("/tasks", { method: "POST", body: JSON.stringify(body) });
  },
  update(id: string, body: { title?: string; description?: string; status?: string }): Promise<Task> {
    return apiRequest(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  delete(id: string): Promise<void> {
    return apiRequest(`/tasks/${id}`, { method: "DELETE" });
  },
  toggle(id: string): Promise<Task> {
    return apiRequest(`/tasks/${id}/toggle`, { method: "POST" });
  },
};
