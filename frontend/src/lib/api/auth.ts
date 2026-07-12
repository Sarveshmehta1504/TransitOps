import { request } from "./client";
import { User, UserRole } from "@/types/user";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Marcus Vance", email: "fleet@transitops.com", role: "Fleet Manager", created_at: "2025-01-10", updated_at: "2025-01-10" },
  { id: 2, name: "Raven K.", email: "dispatcher@transitops.com", role: "Dispatcher", created_at: "2025-02-14", updated_at: "2025-02-14" },
  { id: 3, name: "Dominic Torres", email: "safety@transitops.com", role: "Safety Officer", created_at: "2025-03-01", updated_at: "2025-03-01" },
  { id: 4, name: "Clara Oswald", email: "finance@transitops.com", role: "Financial Analyst", created_at: "2024-08-20", updated_at: "2024-08-20" },
];

/** Map backend role strings → frontend UserRole */
const ROLE_MAP: Record<string, UserRole> = {
  "Admin":            "Fleet Manager",   // Admin gets full Fleet Manager access
  "admin":            "Fleet Manager",
  "Fleet Manager":    "Fleet Manager",
  "fleet_manager":    "Fleet Manager",
  "fleet manager":    "Fleet Manager",
  "Dispatcher":       "Dispatcher",
  "dispatcher":       "Dispatcher",
  "Safety Officer":   "Safety Officer",
  "safety_officer":   "Safety Officer",
  "safety officer":   "Safety Officer",
  "Financial Analyst":"Financial Analyst",
  "financial_analyst":"Financial Analyst",
  "financial analyst":"Financial Analyst",
};

function normalizeRole(raw: string | undefined | null): UserRole {
  if (!raw) return "Fleet Manager";
  return ROLE_MAP[raw] ?? "Fleet Manager";
}

function normalizeUser(raw: any): any {
  if (!raw) return raw;

  // Extract role from roles[] array if role field missing
  const rawRole: string | undefined = raw.role ?? (Array.isArray(raw.roles) ? raw.roles[0] : undefined);
  raw.role = normalizeRole(rawRole);

  // Normalize name — Laravel may omit name or use first_name/last_name
  if (!raw.name) {
    if (raw.first_name || raw.last_name) {
      raw.name = [raw.first_name, raw.last_name].filter(Boolean).join(" ");
    } else if (raw.email) {
      raw.name = (raw.email as string).split("@")[0];
    } else {
      raw.name = "User";
    }
  }

  return raw;
}

export async function login(email: string, password?: string, roleInput?: UserRole): Promise<{ token: string; user: User }> {
  try {
    // Backend returns { success, status, message, token, user }
    const data = await request<any>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, device_name: "transitops-web" }),
    });

    // Handle both { token, user } and { success, token, user } wrapping
    const token: string = data.token;
    const user: any = normalizeUser(data.user);

    if (typeof window !== "undefined") {
      document.cookie = `transitops_auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      localStorage.setItem("transitops_auth_token", token);
      localStorage.setItem("transitops_auth_user", JSON.stringify(user));
    }
    return { token, user };
  } catch (error) {
    // Mock authentication fallback
    const mockUser = MOCK_USERS.find(u => u.email === email) || {
      id: 99,
      name: "Temporary User",
      email,
      role: roleInput || ("Fleet Manager" as UserRole),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const token = "mock_token_" + mockUser.role.replace(/ /g, "_").toLowerCase();

    if (typeof window !== "undefined") {
      document.cookie = `transitops_auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      localStorage.setItem("transitops_auth_token", token);
      localStorage.setItem("transitops_auth_user", JSON.stringify(mockUser));
    }

    return { token, user: mockUser };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("transitops_auth_token");
  if (!token) return null;

  try {
    // request() auto-unwraps { data: {...} } → the user object directly
    const user = await request<any>("/me");
    return normalizeUser(user);
  } catch (_error) {
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
  } catch (_error) {
    // Ignored — token already cleared locally
  }
}
