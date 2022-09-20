import { PrismaClient } from '@prisma/client';
import { setDatabaseUrl } from '@/components/db-connection/DBHelpers';

setDatabaseUrl();

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;