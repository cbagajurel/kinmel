import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

const prismaClient = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismadb = prismaClient;

export default prismaClient;
