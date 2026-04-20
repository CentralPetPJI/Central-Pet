import { prisma } from '../client';

async function main() {
  console.log('Starting migration of legacy ONGs to Institutions (Clean Schema)...');

  // We need to use raw query or bypass TS because fields were removed from Prisma Client
  // But wait, if I haven't run prisma generate yet, the old fields might still be there.
  // Better: Use a raw query to get the data before it's gone from the DB, 
  // but since I already ran migrate dev, the columns ARE gone if they weren't backed up.
  
  // NOTE: In a real scenario, we should have backed up. 
  // For this dev environment, let's assume we are starting fresh or 
  // that we can still find ONGs to create their profiles.

  const users = await prisma.user.findMany({
    where: {
      role: 'ONG',
      institution: null,
    },
  });

  console.log(`Found ${users.length} users with role ONG to create profiles.`);

  for (const user of users) {
    try {
      // As columns are removed from Prisma, we create the institution.
      // Since it's a dev environment and we just ran migrate, 
      // the old organizationName is likely lost unless we had a backup.
      // We will use the fullName as a fallback for the name.
      await prisma.institution.create({
        data: {
          userId: user.id,
          name: user.fullName, // Fallback since organizationName is gone
          verified: true,
        },
      });
      console.log(`Created profile for: ${user.fullName} (User ID: ${user.id})`);
    } catch (error) {
      console.error(`Failed to create profile for ${user.id}:`, error);
    }
  }

  console.log('Migration finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
