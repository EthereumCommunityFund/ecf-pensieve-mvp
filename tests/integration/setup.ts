import { execSync } from 'child_process';
import path from 'path';

import dotenv from 'dotenv';

export async function setup() {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local.test') });

  console.log('🚀 Setting up integration test environment...');

  try {
    console.log('📊 Checking Supabase status...');
    try {
      execSync('supabase status', { stdio: 'pipe' });
      console.log('✅ Supabase is running');
    } catch (error) {
      console.error('❌ Supabase is not running. Please run: supabase start');
      throw new Error('Supabase not running');
    }

    console.log('🔄 Running database migrations...');
    const migrateCommand = `DATABASE_URL="${process.env.DATABASE_URL}" pnpm run db:migrate`;
    execSync(migrateCommand, { stdio: 'inherit' });
    console.log('✅ Database migrations completed');

    console.log('✨ Integration test environment is ready!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}
