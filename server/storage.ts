import { 
  users, 
  tenants, 
  refreshTokens, 
  authAttempts,
  type User, 
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type RefreshToken,
  type InsertRefreshToken,
  type AuthAttempt,
  type InsertAuthAttempt
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  
  // Refresh token operations
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
  
  // Auth attempt operations
  createAuthAttempt(attempt: InsertAuthAttempt): Promise<AuthAttempt>;
  getRecentFailedAttempts(email: string, tenantId: string, minutes: number): Promise<AuthAttempt[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenants: Map<string, Tenant>;
  private refreshTokens: Map<string, RefreshToken>;
  private authAttempts: AuthAttempt[];
  private currentUserId: number;
  private currentRefreshTokenId: number;
  private currentAuthAttemptId: number;

  constructor() {
    this.users = new Map();
    this.tenants = new Map();
    this.refreshTokens = new Map();
    this.authAttempts = [];
    this.currentUserId = 1;
    this.currentRefreshTokenId = 1;
    this.currentAuthAttemptId = 1;

    // Initialize default tenants
    this.initializeDefaultTenants();
  }

  private initializeDefaultTenants() {
    const defaultTenants: Tenant[] = [
      {
        id: "acme-corp",
        name: "ACME Corp",
        logo: "/assets/acme-corp/logo.svg",
        primaryColor: "#1976D2",
        secondaryColor: "#424242",
        config: {
          welcomeMessage: "Secure Enterprise Authentication",
          ssoProviders: ["google", "microsoft"],
          mfaRequired: false
        },
        createdAt: new Date(),
      },
      {
        id: "demo-tenant",
        name: "Demo Tenant",
        logo: "/assets/demo-tenant/logo.svg",
        primaryColor: "#673AB7",
        secondaryColor: "#37474F",
        config: {
          welcomeMessage: "Welcome to Demo Portal",
          ssoProviders: ["google"],
          mfaRequired: true
        },
        createdAt: new Date(),
      }
    ];

    defaultTenants.forEach(tenant => {
      this.tenants.set(tenant.id, tenant);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string, tenantId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email === email && user.tenantId === tenantId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isActive: insertUser.isActive ?? true,
      mfaEnabled: insertUser.mfaEnabled ?? false,
      mfaSecret: insertUser.mfaSecret || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const newTenant: Tenant = {
      ...tenant,
      logo: tenant.logo || null,
      primaryColor: tenant.primaryColor || null,
      secondaryColor: tenant.secondaryColor || null,
      config: tenant.config || null,
      createdAt: new Date(),
    };
    this.tenants.set(tenant.id, newTenant);
    return newTenant;
  }

  async createRefreshToken(tokenData: InsertRefreshToken): Promise<RefreshToken> {
    const id = this.currentRefreshTokenId++;
    const refreshToken: RefreshToken = {
      ...tokenData,
      id,
      createdAt: new Date(),
    };
    this.refreshTokens.set(tokenData.token, refreshToken);
    return refreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.refreshTokens.get(token);
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.refreshTokens.delete(token);
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    const tokensToDelete: string[] = [];
    this.refreshTokens.forEach((tokenData, token) => {
      if (tokenData.userId === userId) {
        tokensToDelete.push(token);
      }
    });
    tokensToDelete.forEach(token => this.refreshTokens.delete(token));
  }

  async createAuthAttempt(attempt: InsertAuthAttempt): Promise<AuthAttempt> {
    const id = this.currentAuthAttemptId++;
    const authAttempt: AuthAttempt = {
      ...attempt,
      id,
      ipAddress: attempt.ipAddress || null,
      userAgent: attempt.userAgent || null,
      createdAt: new Date(),
    };
    this.authAttempts.push(authAttempt);
    return authAttempt;
  }

  async getRecentFailedAttempts(email: string, tenantId: string, minutes: number): Promise<AuthAttempt[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.authAttempts.filter(
      attempt => 
        attempt.email === email &&
        attempt.tenantId === tenantId &&
        !attempt.success &&
        attempt.createdAt && attempt.createdAt > cutoff
    );
  }
}

export const storage = new MemStorage();
