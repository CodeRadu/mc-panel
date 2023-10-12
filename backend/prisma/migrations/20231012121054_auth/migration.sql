/*
  Warnings:

  - Added the required column `autosaveInterval` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `crashes` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volumeName` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "autosaveInterval" INTEGER NOT NULL,
ADD COLUMN     "crashes" INTEGER NOT NULL,
ADD COLUMN     "volumeName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
