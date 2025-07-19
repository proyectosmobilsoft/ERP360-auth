import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  mfaVerifySchema,
  refreshTokenRequestSchema,
  type AuthResponse,
  type User
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

interface AuthRequest extends Request {
  user?: User;
}

// Middleware to verify JWT token
const authenticateToken = async (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Generate tokens
const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Hash password
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

// Verify password
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Rate limiting check
const checkRateLimit = async (email: string, tenantId: string): Promise<boolean> => {
  const recentAttempts = await storage.getRecentFailedAttempts(email, tenantId, 15);
  return recentAttempts.length < 5; // Max 5 failed attempts in 15 minutes
};

// Log auth attempt
const logAuthAttempt = async (email: string, tenantId: string, success: boolean, req: Request) => {
  await storage.createAuthAttempt({
    email,
    tenantId,
    success,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get tenant configuration
  app.get("/api/tenant/:tenantId", async (req, res) => {
    try {
      const { tenantId } = req.params;
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      res.json(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password, tenantId } = validatedData;

      // Check rate limiting
      if (!(await checkRateLimit(email, tenantId))) {
        await logAuthAttempt(email, tenantId, false, req);
        return res.status(429).json({ message: "Too many failed attempts. Please try again later." });
      }

      // Find user
      const user = await storage.getUserByEmail(email, tenantId);
      if (!user || !user.isActive) {
        await logAuthAttempt(email, tenantId, false, req);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        await logAuthAttempt(email, tenantId, false, req);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if MFA is required
      if (user.mfaEnabled && user.mfaSecret) {
        await logAuthAttempt(email, tenantId, true, req);
        // Return partial response indicating MFA is required
        const tempToken = jwt.sign({ userId: user.id, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' });
        return res.json({ 
          requiresMFA: true, 
          tempToken,
          message: "MFA verification required" 
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      await logAuthAttempt(email, tenantId, true, req);

      const response: AuthResponse = {
        user: { ...user, password: '' }, // Don't send password
        accessToken,
        refreshToken,
      };

      res.json(response);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, firstName, lastName, tenantId } = validatedData;

      // Check if tenant exists
      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Invalid tenant" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email, tenantId);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        tenantId,
        isActive: true,
        mfaEnabled: false,
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      await logAuthAttempt(email, tenantId, true, req);

      const response: AuthResponse = {
        user: { ...user, password: '' },
        accessToken,
        refreshToken,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const { email, tenantId } = validatedData;

      // Check if user exists (but don't reveal this information)
      const user = await storage.getUserByEmail(email, tenantId);
      
      // Always return success to prevent email enumeration
      res.json({ message: "If an account exists, a password reset email has been sent" });

      // In a real implementation, you would send an email here
      if (user) {
        console.log(`Password reset requested for user ${user.id}`);
        // TODO: Send password reset email
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // MFA verification endpoint
  app.post("/api/auth/mfa/verify", async (req, res) => {
    try {
      const validatedData = mfaVerifySchema.parse(req.body);
      const { code, userId } = validatedData;

      const user = await storage.getUser(userId);
      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return res.status(400).json({ message: "MFA not enabled for this user" });
      }

      // In a real implementation, you would verify the TOTP code here
      // For demo purposes, accept any 6-digit code
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ message: "Invalid MFA code" });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      const response: AuthResponse = {
        user: { ...user, password: '' },
        accessToken,
        refreshToken,
      };

      res.json(response);
    } catch (error) {
      console.error("MFA verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const validatedData = refreshTokenRequestSchema.parse(req.body);
      const { refreshToken } = validatedData;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      const storedToken = await storage.getRefreshToken(refreshToken);

      if (!storedToken || storedToken.expiresAt < new Date()) {
        await storage.deleteRefreshToken(refreshToken);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }

      const user = await storage.getUser(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      // Delete old refresh token and create new one
      await storage.deleteRefreshToken(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createRefreshToken({
        userId: user.id,
        token: newRefreshToken,
        expiresAt,
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ ...req.user, password: '' });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      
      if (refreshToken) {
        await storage.deleteRefreshToken(refreshToken);
      }

      // In a more complete implementation, you might invalidate all tokens for the user
      // await storage.deleteUserRefreshTokens(req.user!.id);

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
