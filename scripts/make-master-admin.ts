#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv';
import { setDatabaseUrl } from '../components/db-connection/DBHelpers';
import Roles from '../components/constants/Roles';

const prisma = new PrismaClient()
dotenv.config({ path: '.env.local' });

async function main() {
    
    setDatabaseUrl();

    if (!process.argv[2]) {
      console.log('Missing required arguments')
      console.log('Usage: make-master-admin.ts my@email.com')
      return;
    }

    const matchingperson = await prisma.person.findFirst({
      where: {
        email: process.argv[2]
      }
    });

    await prisma.person.update({
      where: {
        id: matchingperson.id
      },
      data: {
        person_system_role: {
          create: {
            system_role: {
              connect: {
                role: Roles.masterAdmin.role
              }
            }
          }
        }
      }
    })
    
    console.log("Successfully made a master admin")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

