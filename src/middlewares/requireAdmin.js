function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tenés permisos de administrador' });
  }
  next();
}

module.exports = requireAdmin;
