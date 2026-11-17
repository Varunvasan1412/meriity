const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: Record<string, string[]>) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message ?? "Request failed", res.status, data.errors);
  return data as T;
}

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};

export const api = {
  submitContact: (body: ContactPayload) =>
    request<{ id: number; message: string }>("/contact", { method: "POST", body: JSON.stringify(body) }),
  subscribe: (email: string) =>
    request<{ message: string }>("/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
};
