import { PrismaClient }   from '@prisma/client';
import { setDatabaseUrl } from '@/components/db-connection/DBHelpers';

setDatabaseUrl();

const prisma : PrismaClient = (() => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }

  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  return global.prisma;
})();

export default prisma;
