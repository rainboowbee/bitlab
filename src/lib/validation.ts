import { z } from 'zod'

// Кастомная валидация для дат
const dateStringSchema = z.string().refine((val) => {
  try {
    new Date(val)
    return true
  } catch {
    return false
  }
}, {
  message: "Invalid date string"
})

// Схемы валидации для пользователей
export const CreateUserSchema = z.object({
  telegramId: z.number().positive(),
  username: z.union([z.string(), z.null()]).optional(),
  firstName: z.union([z.string(), z.null()]).optional(),
  lastName: z.union([z.string(), z.null()]).optional(),
  phoneNumber: z.union([z.string(), z.null()]).optional(),
  languageCode: z.union([z.string(), z.null()]).optional(),
  isPremium: z.union([z.boolean(), z.null()]).default(false),
  isBot: z.union([z.boolean(), z.null()]).default(false),
  hasSubscription: z.union([z.boolean(), z.null()]).default(false),
  tokenBalance: z.union([z.number().int(), z.null()]).default(0),
  privacyAccepted: z.union([z.boolean(), z.null()]).default(false),
  privacyAcceptedAt: z.union([dateStringSchema, z.null()]).optional(),
  lastTokensIssuedAt: z.union([dateStringSchema, z.null()]).optional(),
  source: z.union([z.string(), z.null()]).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']).default('ACTIVE')
})

export const UpdateUserSchema = z.object({
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  languageCode: z.string().optional(),
  isPremium: z.boolean().optional(),
  hasSubscription: z.boolean().optional(),
  tokenBalance: z.number().int().optional(),
  privacyAccepted: z.boolean().optional(),
  privacyAcceptedAt: dateStringSchema.optional(),
  lastTokensIssuedAt: dateStringSchema.optional(),
  lastActivityAt: dateStringSchema.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional()
})

// Схемы валидации для взаимодействий
export const CreateInteractionSchema = z.object({
  telegramUserId: z.string().min(1),
  interactionType: z.enum([
    'COMMAND_START',
    'COMMAND_HELP',
    'COMMAND_SETTINGS',
    'BUTTON_CLICK',
    'MENU_SELECTION',
    'PAYMENT',
    'SUBSCRIPTION',
    'FEEDBACK',
    'SUPPORT_REQUEST',
    'START',
    'DOMAIN_SELECTED',
    'CATEGORY_SELECTED',
    'BUTTON_PROFILE',
    'BUTTON_DOMAINS',
    'BUTTON_SUPPORT',
    'BACK_TO_MAIN',
    'PARSER_START',
    'SUBSCRIPTION_REQUEST',
    'SUBSCRIPTION_PAYMENT',
    'OTHER'
  ]),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: dateStringSchema.optional()
})

// Схемы валидации для сообщений
export const CreateMessageSchema = z.object({
  telegramUserId: z.string().min(1),
  messageId: z.number().positive(),
  chatId: z.number().positive(),
  text: z.string().optional(),
  messageType: z.enum([
    'TEXT',
    'PHOTO',
    'VIDEO',
    'AUDIO',
    'DOCUMENT',
    'STICKER',
    'VOICE',
    'LOCATION',
    'CONTACT',
    'OTHER'
  ]).default('TEXT'),
  timestamp: dateStringSchema.optional(),
  isFromBot: z.boolean().default(false)
})

// Схемы валидации для аутентификации
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// Схемы валидации для админов
export const CreateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER']).default('ADMIN')
})

export const UpdateAdminSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER']).optional(),
  isActive: z.boolean().optional()
})

// Типы для TypeScript
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>

// Схема для учета использования токенов
export const CreateTokenUsageSchema = z.object({
  telegramId: z.number().positive(),
  model: z.string().min(1),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  cost: z.number().optional(),
  source: z.string().optional(),
  createdAt: dateStringSchema.optional()
})

export type CreateTokenUsageInput = z.infer<typeof CreateTokenUsageSchema>
