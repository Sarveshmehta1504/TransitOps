import { request } from "./client";
import { User, UserRole } from "@/types/user";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Marcus Vance", email: "fleet@transitops.com", role: "Fleet Manager", created_at: "2025-01-10", updated_at: "2025-01-10" },
  { id: 2, name: "Raven K.", email: "dispatcher@transitops.com", role: "Dispatcher", created_at: "2025-02-14", updated_at: "2025-02-14" },
  { id: 3, name: "Dominic Torres", email: "safety@transitops.com", role: "Safety Officer", created_at: "2025-03-01", updated_at: "2025-03-01" },
  { id: 4, name: "Clara Oswald", email: "finance@transitops.com", role: "Financial Analyst", created_at: "2024-08-20", updated_at: "2024-08-20" },
];

function normalizeUser(raw: any): any {
  if (!raw) return raw;
  // Normalize role from roles array if needed
  if (raw.roles && !raw.role) {
    raw.role = raw.roles[0];
  }
  // Normalize name — Laravel may return first_name/last_name instead of name
  if (!raw.name) {
    if (raw.first_name || raw.last_name) {
      raw.name = [raw.first_name, raw.last_name].filter(Boolean).join(" ");
    } else if (raw.email) {
      raw.name = raw.email.split("@")[0];
    } else {
      raw.name = "User";
    }
  }
  return raw;
}

export async function login(email: string, password?: string, roleInput?: UserRole): Promise<{ token: string; user: User }> {
  try {
    // Try sending login to backend (if configured)
    const data = await request<{ token: string; user: any }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, device_name: "transitops-web" }),
    });
    
    normalizeUser(data.user);
    
    if (typeof window !== "undefined") {
      document.cookie = `transitops_auth_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
      localStorage.setItem("transitops_auth_token", data.token);
      localStorage.setItem("transitops_auth_user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    // Mock authentication fallback
    const user = MOCK_USERS.find(u => u.email === email) || {
      id: 99,
      name: "Temporary User",
      email,
      role: roleInput || "Fleet Manager",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const token = "mock_token_" + user.role.replace(" ", "_").toLowerCase();
    
    if (typeof window !== "undefined") {
      document.cookie = `transitops_auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      localStorage.setItem("transitops_auth_token", token);
      localStorage.setItem("transitops_auth_user", JSON.stringify(user));
    }
    
    return { token, user };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("transitops_auth_token");
  if (!token) return null;
  
  try {
    const user = await request<any>("/me");
    normalizeUser(user);
    return user;
  } catch (error) {
    const userStr = localStorage.getItem("transitops_auth_user");
    const parsed = userStr ? JSON.parse(userStr) : null;
    return normalizeUser(parsed);
  }
}


export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    document.cookie = "transitops_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("transitops_auth_token");
    localStorage.removeItem("transitops_auth_user");
  }
  try {
    await request("/logout", { method: "POST" });
  } catch (error) {
    // Ignored in mock fallback
  }
}
