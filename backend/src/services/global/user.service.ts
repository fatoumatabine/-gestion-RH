import { userRepository } from '../../repositories/global/user.repository.js'
import { createUserSchema, updateUserSchema, CreateUserInput, UpdateUserInput } from '../../validations/global/user.validation.js'
import bcrypt from 'bcrypt'

export class UserService {
  async createUser(data: CreateUserInput) {
    // Validate input
    const validatedData = createUserSchema.parse(data)

    // Check if user exists
    const existingUser = await userRepository.findByEmail(validatedData.email)
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const { password, ...userData } = validatedData
    const userDataWithHash = {
      ...userData,
      passwordHash: hashedPassword
    }

    return userRepository.create(userData)
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    return user
  }

  async getUserByEmail(email: string) {
    return userRepository.findByEmail(email)
  }

  async updateUser(id: number, data: UpdateUserInput) {
    // Validate input
    const validatedData = updateUserSchema.parse(data)

    // Check if user exists
    const existingUser = await userRepository.findById(id)
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé')
    }

    // Check email uniqueness if changing
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(validatedData.email)
      if (userWithEmail) {
        throw new Error('Un utilisateur avec cet email existe déjà')
      }
    }

    return userRepository.update(id, validatedData)
  }

  async deleteUser(id: number) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    await userRepository.delete(id)
    return { message: 'Utilisateur supprimé avec succès' }
  }

  async getAllUsers(options: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search } = options
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } }
      ]
    }

    const [users, total] = await Promise.all([
      userRepository.findAll({ skip, take: limit, where }),
      userRepository.count(where)
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
  }
}

export const userService = new UserService()