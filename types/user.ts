export type UserRole = "user" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface UserDocument {
  _id?: import("mongodb").ObjectId
  name?: string | null
  email: string
  password?: string
  role: UserRole
  image?: string | null
  emailVerified?: Date | string | null
  createdAt?: Date
  updatedAt?: Date
}
