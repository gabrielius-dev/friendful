/*
  Warnings:

  - You are about to drop the column `heartCount` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `heartCount` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
-- ALTER TABLE "Comment" DROP COLUMN "heartCount",
ALTER TABLE "Comment" ADD COLUMN "loveCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
-- ALTER TABLE "Post" DROP COLUMN "heartCount",
ALTER TABLE "Post" ADD COLUMN "loveCount" INTEGER NOT NULL DEFAULT 0;
