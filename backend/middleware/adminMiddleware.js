function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can do this action.' });
  }

  next();
}

module.exports = adminOnly;