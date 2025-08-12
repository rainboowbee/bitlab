-- AlterTable
ALTER TABLE "public"."telegram_users" ADD COLUMN     "lastTokensIssuedAt" TIMESTAMP(3),
ADD COLUMN     "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3);
