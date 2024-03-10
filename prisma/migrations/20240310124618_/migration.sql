/*
  Warnings:

  - The values [heart] on the enum `LikeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LikeType_new" AS ENUM ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry');
ALTER TABLE "Like" ALTER COLUMN "type" TYPE "LikeType_new" USING ("type"::text::"LikeType_new");
ALTER TABLE "CommentLike" ALTER COLUMN "type" TYPE "LikeType_new" USING ("type"::text::"LikeType_new");
ALTER TYPE "LikeType" RENAME TO "LikeType_old";
ALTER TYPE "LikeType_new" RENAME TO "LikeType";
DROP TYPE "LikeType_old";
COMMIT;
