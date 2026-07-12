const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function apiGet<T>(path: string): Promise<T> {
  // Normalize leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_URL}${cleanPath}`;
  
  const res = await fetch(url, {
    // Prevent Next.js from caching API calls for testing purposes
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status} (${res.statusText})`);
  }
  
  return res.json() as Promise<T>;
}
