import { prisma } from '../app/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: Role
}

export interface LoginData {
  email: string
  password: string
}

export class UserModel {
  static async create(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  static async getAllAdmins() {
    return await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })
  }

  static async updateRole(id: string, role: Role) {
    return await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id }
    })
  }
}