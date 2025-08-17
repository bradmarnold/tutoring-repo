// Helper function for admin authentication
export function authenticateAdmin(req) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  return true;
}

export function requireAdmin(req) {
  if (!authenticateAdmin(req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}