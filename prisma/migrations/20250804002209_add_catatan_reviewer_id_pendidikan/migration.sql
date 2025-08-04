-- AlterTable
ALTER TABLE "Pendidikan" ADD COLUMN     "reviewerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Pendidikan" ADD CONSTRAINT "Pendidikan_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
