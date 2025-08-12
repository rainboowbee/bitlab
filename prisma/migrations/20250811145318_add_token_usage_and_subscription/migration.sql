-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER', 'VOICE', 'LOCATION', 'CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InteractionType" AS ENUM ('COMMAND_START', 'COMMAND_HELP', 'COMMAND_SETTINGS', 'BUTTON_CLICK', 'MENU_SELECTION', 'PAYMENT', 'SUBSCRIPTION', 'FEEDBACK', 'SUPPORT_REQUEST', 'START', 'DOMAIN_SELECTED', 'CATEGORY_SELECTED', 'BUTTON_PROFILE', 'BUTTON_DOMAINS', 'BUTTON_SUPPORT', 'BACK_TO_MAIN', 'PARSER_START', 'SUBSCRIPTION_REQUEST', 'SUBSCRIPTION_PAYMENT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."telegram_users" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "languageCode" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "hasSubscription" BOOLEAN NOT NULL DEFAULT false,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "notes" TEXT,
    "source" TEXT,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "messageId" BIGINT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "text" TEXT,
    "messageType" "public"."MessageType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "isFromBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interactions" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "interactionType" "public"."InteractionType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_activities" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."token_usage" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_telegramId_key" ON "public"."telegram_users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_name_key" ON "public"."metrics"("name");

-- CreateIndex
CREATE INDEX "token_usage_telegramUserId_idx" ON "public"."token_usage"("telegramUserId");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "public"."telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interactions" ADD CONSTRAINT "interactions_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "public"."telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_activities" ADD CONSTRAINT "admin_activities_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."token_usage" ADD CONSTRAINT "token_usage_telegramUserId_fkey" FOREIGN KEY ("telegramUserId") REFERENCES "public"."telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
