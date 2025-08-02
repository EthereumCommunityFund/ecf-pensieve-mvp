import { db } from '@/lib/db';
import { addDefaultListToUser } from '@/lib/services/listService';

async function addDefaultList() {
  try {
    console.log('Starting to add default list to user...');

    const profiles = await db.query.profiles.findMany();

    for (const profile of profiles) {
      await addDefaultListToUser(profile.userId);
      console.log(`Added default list to user ${profile.name}`);
    }

    console.log('Done');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addDefaultList()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}
