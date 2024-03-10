-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "saved" TEXT[],
ADD COLUMN     "share" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "saved" TEXT[];
