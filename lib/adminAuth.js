import { cookies } from "next/headers";

// Helper function for admin authentication - supports both cookie and header
export function authenticateAdmin(req) {
  // First try header auth
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey && adminKey === process.env.ADMIN_PASSWORD) {
    return true;
  }
  
  // Then try cookie auth
  try {
    const cookieStore = cookies();
    const adminCookie = cookieStore.get("admin");
    if (adminCookie && adminCookie.value === "1") {
      return true;
    }
  } catch (e) {
    // cookies() might not be available in all contexts
  }
  
  return false;
}

export function requireAdmin(req) {
  if (!authenticateAdmin(req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}