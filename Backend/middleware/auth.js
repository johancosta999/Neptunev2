// If x-role not provided, infer ADMIN when id starts with "admin"
module.exports = function mockAuth(req, _res, next) {
  const id = req.header("x-user-id") || null;                 // e.g., "user-123" or "admin-1"
  let role = (req.header("x-role") || "").toUpperCase();      // USER | ADMIN (optional)
  if (!role) role = id && id.toLowerCase().startsWith("admin") ? "ADMIN" : "USER";
  req.user = { id, role };
  next();
};