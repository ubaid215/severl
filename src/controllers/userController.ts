import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/models/User'
import jwt, { SignOptions } from "jsonwebtoken"

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "7d"


export class UserController {
  static async login(req: NextRequest) {
  try {
    console.log("🟢 Login attempt started");

    const { email, password } = await req.json();
    console.log("📩 Request body:", { email, hasPassword: !!password });

    if (!email || !password) {
      console.warn("⚠️ Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    console.log("👤 User lookup result:", user ? { id: user.id, role: user.role } : null);

    if (!user) {
      console.warn("❌ Invalid credentials: User not found", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      console.warn("⛔ Access denied for non-admin user", { id: user.id, role: user.role });
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Validate password
    const isValidPassword = await UserModel.validatePassword(password, user.password);
    console.log("🔑 Password validation result:", isValidPassword);

    if (!isValidPassword) {
      console.warn("❌ Invalid credentials: Wrong password", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    console.log("🔐 Generating JWT token for user", { id: user.id, email: user.email });
   const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role,
  },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN } as SignOptions
);

    // Return user data without password
    const userData = await UserModel.findById(user.id);
    console.log("✅ Login successful", { id: user.id, role: user.role });

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


  static async getProfile(req: NextRequest) {
    try {
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET) as any

      const user = await UserModel.findById(decoded.userId)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  static async createAdmin(req: NextRequest) {
    try {
      const { email, password, name, role = 'ADMIN' } = await req.json()

      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Email, password, and name are required' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      const user = await UserModel.create({
        email,
        password,
        name,
        role
      })

      return NextResponse.json({
        success: true,
        data: user,
        message: 'Admin created successfully'
      }, { status: 201 })
    } catch (error) {
      console.error('Create admin error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static async getAllAdmins(req: NextRequest) {
    try {
      const admins = await UserModel.getAllAdmins()

      return NextResponse.json({
        success: true,
        data: admins
      })
    } catch (error) {
      console.error('Get admins error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  static verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  static extractTokenFromRequest(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }
}