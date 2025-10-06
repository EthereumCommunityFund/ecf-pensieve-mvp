import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';

import { config as loadEnv } from 'dotenv';

import { sendProjectPublishTweet } from '../lib/services/twitter';

loadEnv();
loadEnv({ path: '.env.local', override: true });

type RawProject = {
  id: number | string;
  name: string;
  tagline?: string;
  logoUrl: string;
};

function normaliseProject(raw: RawProject) {
  const id = Number(raw.id);

  if (Number.isNaN(id)) {
    throw new Error('Project id must be a number.');
  }

  const name = raw.name?.trim();
  if (!name) {
    throw new Error('Project name cannot be empty.');
  }

  const tagline = raw.tagline?.trim() ?? '';
  const logoUrl = raw.logoUrl?.trim();

  if (!logoUrl) {
    throw new Error('Project logoUrl cannot be empty.');
  }

  return {
    id,
    name,
    tagline,
    logoUrl,
  };
}

async function readProjectFromPrompt(): Promise<RawProject> {
  const rl = readline.createInterface({ input, output });

  try {
    const id = await rl.question('Project ID: ');
    const name = await rl.question('Project Name: ');
    const tagline = await rl.question('Project Tagline (optional): ');
    const logoUrl = await rl.question('Project Logo URL: ');

    return {
      id: id.trim(),
      name,
      tagline,
      logoUrl,
    };
  } finally {
    rl.close();
  }
}

async function readProjectPayload(): Promise<RawProject> {
  const [, , rawProject] = process.argv;

  if (rawProject) {
    let projectData: unknown;

    try {
      projectData = JSON.parse(rawProject);
    } catch (error) {
      throw new Error(
        `Failed to parse project JSON: ${(error as Error).message}`,
      );
    }

    if (typeof projectData !== 'object' || projectData === null) {
      throw new Error('Project payload must be a JSON object.');
    }

    return projectData as RawProject;
  }

  console.log('No JSON payload provided. Please enter project details:');
  return readProjectFromPrompt();
}

async function main() {
  let project: RawProject;

  try {
    project = await readProjectPayload();
  } catch (error) {
    console.error('Unable to read project details:', error);
    process.exit(1);
  }

  let parsedProject;

  try {
    parsedProject = normaliseProject(project);
  } catch (error) {
    console.error('Project data invalid:', error);
    process.exit(1);
  }

  console.log('Sending tweet for project:', parsedProject);

  try {
    const success = await sendProjectPublishTweet(parsedProject);
    if (success) {
      console.log('Tweet sent successfully.');
    } else {
      console.error('Tweet sending reported failure.');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Tweet sending threw an error.');
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
