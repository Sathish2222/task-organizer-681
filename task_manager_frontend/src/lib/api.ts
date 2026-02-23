export type ApiErrorPayload = {
  detail?: unknown;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type User = {
  id: string | number;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  token_type?: string;
  user?: User;
};

export type TaskPriority = "low" | "medium" | "high" | number | null;

export type Task = {
  id: string | number;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null; // ISO date string
  priority?: TaskPriority;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  due_date?: string;
  priority?: TaskPriority;
  tags?: string[];
};

export type TaskUpdateInput = Partial<TaskCreateInput> & {
  completed?: boolean;
};

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return "";
  return base.replace(/\/+$/, "");
}

async function parseJsonSafe(resp: Response): Promise<unknown> {
  const text = await resp.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(
  path: string,
  opts: {
    method?: string;
    token?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment.",
      0
    );
  }

  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers ?? {}),
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const resp = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!resp.ok) {
    const payload = await parseJsonSafe(resp);

    // parseJsonSafe returns unknown; narrow before property access.
    const maybeObj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    const messageFromPayload =
      maybeObj && typeof maybeObj["message"] === "string"
        ? (maybeObj["message"] as string)
        : maybeObj && typeof maybeObj["detail"] === "string"
          ? (maybeObj["detail"] as string)
          : undefined;

    const message = messageFromPayload ?? `Request failed with status ${resp.status}`;
    throw new ApiError(message, resp.status, payload as ApiErrorPayload | undefined);
  }

  return (await parseJsonSafe(resp)) as T;
}

async function tryPaths<T>(
  paths: Array<{ path: string; method?: string; body?: unknown; headers?: Record<string, string> }>,
  token?: string | null
): Promise<T> {
  let lastErr: unknown = undefined;
  for (const p of paths) {
    try {
      return await request<T>(p.path, {
        method: p.method,
        token,
        body: p.body,
        headers: p.headers,
      });
    } catch (e) {
      lastErr = e;
      // If it's unauthorized, don't try other shapes that won't fix it.
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All endpoint attempts failed");
}

export const api = {
  // PUBLIC_INTERFACE
  async health(): Promise<unknown> {
    /** Checks backend health. */
    return request<unknown>("/");
  },

  // PUBLIC_INTERFACE
  async signup(email: string, password: string): Promise<AuthResponse> {
    /** Attempts to sign up a new user. Endpoint paths are tried in a fallback order. */
    return tryPaths<AuthResponse>(
      [
        { path: "/auth/signup", method: "POST", body: { email, password } },
        { path: "/auth/register", method: "POST", body: { email, password } },
        { path: "/signup", method: "POST", body: { email, password } },
        { path: "/register", method: "POST", body: { email, password } },
      ],
      null
    );
  },

  // PUBLIC_INTERFACE
  async login(email: string, password: string): Promise<AuthResponse> {
    /** Attempts to login. Supports both JSON and OAuth2PasswordRequestForm-style if backend expects it. */
    return tryPaths<AuthResponse>(
      [
        { path: "/auth/login", method: "POST", body: { email, password } },
        { path: "/login", method: "POST", body: { email, password } },
        {
          path: "/token",
          method: "POST",
          // Some FastAPI templates use form-urlencoded token endpoint
          body: undefined,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      ],
      null
    ).catch(async (e) => {
      // If /token was attempted with undefined body, retry with actual form body.
      if (e instanceof ApiError && e.status !== 401 && e.status !== 403) {
        const base = getApiBaseUrl();
        if (!base) throw e;

        const tokenUrl = `${base}/token`;
        const resp = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ username: email, password }),
        });
        if (!resp.ok) {
          const payload = await parseJsonSafe(resp);

          const maybeObj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
          const messageFromPayload =
            maybeObj && typeof maybeObj["message"] === "string"
              ? (maybeObj["message"] as string)
              : maybeObj && typeof maybeObj["detail"] === "string"
                ? (maybeObj["detail"] as string)
                : undefined;

          const message = messageFromPayload ?? `Request failed with status ${resp.status}`;
          throw new ApiError(message, resp.status, payload as ApiErrorPayload | undefined);
        }
        return (await parseJsonSafe(resp)) as AuthResponse;
      }
      throw e;
    });
  },

  // PUBLIC_INTERFACE
  async me(token: string): Promise<User> {
    /** Fetches the current user profile. */
    return tryPaths<User>(
      [
        { path: "/auth/me", method: "GET" },
        { path: "/me", method: "GET" },
        { path: "/users/me", method: "GET" },
      ],
      token
    );
  },

  // PUBLIC_INTERFACE
  async listTasks(
    token: string,
    params?: {
      q?: string;
      tag?: string;
      completed?: boolean | null;
      priority?: string | number;
      dueBefore?: string;
      dueAfter?: string;
    }
  ): Promise<Task[]> {
    /** Lists tasks with optional filters/search. */
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.tag) sp.set("tag", params.tag);
    if (params?.completed !== undefined && params.completed !== null)
      sp.set("completed", String(params.completed));
    if (params?.priority !== undefined) sp.set("priority", String(params.priority));
    if (params?.dueBefore) sp.set("due_before", params.dueBefore);
    if (params?.dueAfter) sp.set("due_after", params.dueAfter);

    const qs = sp.toString() ? `?${sp.toString()}` : "";

    return tryPaths<Task[]>(
      [
        { path: `/tasks${qs}`, method: "GET" },
        { path: `/api/tasks${qs}`, method: "GET" },
      ],
      token
    );
  },

  // PUBLIC_INTERFACE
  async createTask(token: string, input: TaskCreateInput): Promise<Task> {
    /** Creates a new task. */
    return tryPaths<Task>(
      [
        { path: "/tasks", method: "POST", body: input },
        { path: "/api/tasks", method: "POST", body: input },
      ],
      token
    );
  },

  // PUBLIC_INTERFACE
  async updateTask(token: string, id: Task["id"], input: TaskUpdateInput): Promise<Task> {
    /** Updates an existing task. */
    return tryPaths<Task>(
      [
        { path: `/tasks/${id}`, method: "PATCH", body: input },
        { path: `/tasks/${id}`, method: "PUT", body: input },
        { path: `/api/tasks/${id}`, method: "PATCH", body: input },
        { path: `/api/tasks/${id}`, method: "PUT", body: input },
      ],
      token
    );
  },

  // PUBLIC_INTERFACE
  async deleteTask(token: string, id: Task["id"]): Promise<{ ok: boolean } | unknown> {
    /** Deletes a task. */
    return tryPaths<{ ok: boolean } | unknown>(
      [
        { path: `/tasks/${id}`, method: "DELETE" },
        { path: `/api/tasks/${id}`, method: "DELETE" },
      ],
      token
    );
  },
};
