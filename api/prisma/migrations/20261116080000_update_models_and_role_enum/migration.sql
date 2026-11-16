-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MEMBER', 'LIBRARIAN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "available" INTEGER DEFAULT 1,
ADD COLUMN     "copies" INTEGER DEFAULT 1,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "publishedYear" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'MEMBER';

