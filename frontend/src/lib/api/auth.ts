import { request } from "./client";
import { User, UserRole } from "@/types/user";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Marcus Vance", email: "manager@transitops.in", role: "Fleet Manager", created_at: "2025-01-10", updated_at: "2025-01-10" },
  { id: 2, name: "Raven K.", email: "Raven.k@transitops.in", role: "Dispatcher", created_at: "2025-02-14", updated_at: "2025-02-14" },
  { id: 3, name: "Dominic Torres", email: "safety@transitops.in", role: "Safety Officer", created_at: "2025-03-01", updated_at: "2025-03-01" },
  { id: 4, name: "Clara Oswald", email: "analyst@transitops.in", role: "Financial Analyst", created_at: "2024-08-20", updated_at: "2024-08-20" },
];

export async function login(email: string, roleInput?: UserRole): Promise<{ token: string; user: User }> {
  try {
    // Try sending login to backend (if configured)
    const data = await request<{ token: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    
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
    return await request<User>("/user");
  } catch (error) {
    const userStr = localStorage.getItem("transitops_auth_user");
    return userStr ? JSON.parse(userStr) : null;
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
