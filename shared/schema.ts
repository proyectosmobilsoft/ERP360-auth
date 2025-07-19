import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  tenantId: text("tenant_id").notNull(),
  isActive: boolean("is_active").default(true),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#1976D2"),
  secondaryColor: text("secondary_color").default("#424242"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authAttempts = pgTable("auth_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  tenantId: text("tenant_id").notNull(),
  success: boolean("success").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  createdAt: true,
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export const insertAuthAttemptSchema = createInsertSchema(authAttempts).omit({
  id: true,
  createdAt: true,
});

// Login/Register schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
  tenantId: z.string().min(1, "Tenant ID is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  tenantId: z.string().min(1, "Tenant ID is required"),
});

export const mfaVerifySchema = z.object({
  code: z.string().length(6, "MFA code must be 6 digits"),
  userId: z.number(),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertAuthAttempt = z.infer<typeof insertAuthAttemptSchema>;
export type AuthAttempt = typeof authAttempts.$inferSelect;

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type MFAVerifyRequest = z.infer<typeof mfaVerifySchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresMFA?: boolean;
}

export interface TenantConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  ssoProviders?: string[];
  mfaRequired?: boolean;
}
