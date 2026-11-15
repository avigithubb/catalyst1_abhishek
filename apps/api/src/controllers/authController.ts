import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { PatientModel } from '../models/patientModel';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_elderly_care_jwt_key_2026_xyz';

export const AuthController = {
  login: async (req: Request, res: Response) => {
    // Supports login via email OR username/display name
    const { identifier, email, username, password, passcode } = req.body;
    const loginIdentifier = (identifier || email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Email or username and password are required' });
    }

    try {
      const userRes = await UserModel.findByEmailOrUsernameWithProfile(loginIdentifier);

      if (userRes.rowCount === 0) {
        return res.status(401).json({ message: 'Invalid email/username or password' });
      }

      const user = userRes.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email/username or password' });
      }

      if (passcode && passcode !== user.access_passcode) {
        return res.status(403).json({ message: 'Invalid shared family access passcode' });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          patientProfileId: user.patient_profile_id,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        sharedProfileId: user.patient_profile_id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientProfileId: user.patient_profile_id,
        },
      });
    } catch (error) {
      console.error('AuthController.login error:', error);
      return res.status(500).json({ message: 'Internal server error during authentication' });
    }
  },

  register: async (req: Request, res: Response) => {
    const { name, email, password, role = 'caregiver', passcode = '2026' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Strict Duplicate Verification
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser.rowCount && existingUser.rowCount > 0) {
        return res.status(409).json({ 
          message: 'An account with this email address is already registered. Please sign in instead.' 
        });
      }

      // 2. Validate Family Passcode
      const patientRes = await PatientModel.findByPasscode(passcode);
      if (patientRes.rowCount === 0) {
        return res.status(400).json({ message: 'Invalid shared family passcode. Access denied to this patient ecosystem.' });
      }

      const patientProfileId = patientRes.rows[0].id;
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const userId = `usr_${Date.now()}`;

      await UserModel.create({
        id: userId,
        patientProfileId,
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role,
      });

      const token = jwt.sign(
        {
          userId,
          email: normalizedEmail,
          role,
          patientProfileId,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        sharedProfileId: patientProfileId,
        user: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          role,
          patientProfileId,
        },
      });
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }
      console.error('AuthController.register error:', error);
      return res.status(500).json({ message: 'Failed to register account' });
    }
  },

  googleOAuth: async (req: Request, res: Response) => {
    const { credential, email, name, passcode = '2026' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'OAuth user identity details missing' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Check if user already exists
      let userRes = await UserModel.findByEmailWithProfile(normalizedEmail);
      let user: any = null;

      if (userRes.rowCount && userRes.rowCount > 0) {
        user = userRes.rows[0];
      } else {
        // Register new OAuth member into the shared ecosystem
        const patientRes = await PatientModel.findByPasscode(passcode);
        const patientProfileId = patientRes.rowCount ? patientRes.rows[0].id : 'pat_101';
        const dummyPasswordHash = await bcrypt.hash(`oauth_${Date.now()}`, 10);
        const userId = `usr_g_${Date.now()}`;

        await UserModel.create({
          id: userId,
          patientProfileId,
          email: normalizedEmail,
          passwordHash: dummyPasswordHash,
          name: (name || normalizedEmail.split('@')[0]).trim(),
          role: 'caregiver',
        });

        user = {
          id: userId,
          name: name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: 'caregiver',
          patient_profile_id: patientProfileId,
        };
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          patientProfileId: user.patient_profile_id || user.patientProfileId,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        sharedProfileId: user.patient_profile_id || user.patientProfileId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientProfileId: user.patient_profile_id || user.patientProfileId,
        },
      });
    } catch (error) {
      console.error('AuthController.googleOAuth error:', error);
      return res.status(500).json({ message: 'Google OAuth authentication failed' });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userRes = await UserModel.findById(req.user?.userId || '');
      if (userRes.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(userRes.rows[0]);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to retrieve profile' });
    }
  }
};
