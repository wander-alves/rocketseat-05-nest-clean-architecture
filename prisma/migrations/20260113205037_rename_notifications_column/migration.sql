/*
  Warnings:

  - You are about to drop the column `readed_at` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "readed_at",
ADD COLUMN     "read_at" TIMESTAMP(3);
