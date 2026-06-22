const { z } = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/db');

const SALT_ROUNDS = 10;

function signToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
});

async function register(req, res, next) {
  try {
    const { email, password, nombre } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, nombre, role: 'CLIENTE' },
    });

    const token = signToken(user.id, user.role);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Esta cuenta usa login con Google' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = signToken(user.id, user.role);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/google
const googleSchema = z.object({
  idToken: z.string().min(1),
});

const googleClient = new OAuth2Client();

async function googleLogin(req, res, next) {
  try {
    const { idToken } = googleSchema.parse(req.body);

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(401).json({ error: 'Token de Google inválido' });
    }

    const { sub: googleId, email, name: nombre } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: { email, nombre, googleId, role: 'CLIENTE' },
      });
    }

    const token = signToken(user.id, user.role);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, googleLogin, me };
