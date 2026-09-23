import { Request, Response } from 'express';
import { prisma } from '../config';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../types';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully!',
      user,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = generateToken(authUser);

    res.status(200).json({
      message: 'Welcome back!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: 'Logged out successfully.' });
}
