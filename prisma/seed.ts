#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv';
import { setDatabaseUrl } from '../components/db-connection/DBHelpers';
import Roles from '../components/constants/Roles'

const prisma = new PrismaClient()
dotenv.config({ path: '.env.local' });

async function main() {
    
    setDatabaseUrl();
    
    const organization = {
      id_ref: 'cck',
      name: 'Cambridge Community Kitchen',
      description: 'Cambridge Community Kitchen is a food solidarity collective dedicated to tackling food poverty in Cambridge.',
      event_category: {
        create: {
          id_ref: "meal-prep-delivery",
          name: "Meal prep & delivery",
          description: "Several times a week, CCK prepares and delivers free, hot, plant-based meals to those who need them."
        }
      }
    }

    const cck = await prisma.organization.upsert({
        where: { id_ref: 'cck' },
        update: organization,
        create: organization,
    });

    for (var key in Roles) {
      await prisma.system_role.upsert({
        where: { role: Roles[key].role },
        update: {},
        create: Roles[key],
      })
    }
    
    console.log("Database successfully seeded with cck data.")
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

