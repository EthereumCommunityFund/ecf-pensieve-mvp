import { Uploader } from '@irys/upload';
import { Ethereum } from '@irys/upload-ethereum';
import archiver from 'archiver';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

let irysUploader: any;

async function initializeIrys() {
  if (irysUploader) return irysUploader;

  const privateKey = process.env.IRYS_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('IRYS_PRIVATE_KEY environment variable is required');
  }

  const infuraKey = process.env.INFURA_KEY;
  if (!infuraKey) {
    throw new Error('INFURA_KEY environment variable is required');
  }

  // Use mainnet for both dev and production environments
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error('RPC_URL environment variable is required');
  }

  console.log(`Using RPC: ${rpcUrl}`);

  irysUploader = await Uploader(Ethereum)
    .withWallet(privateKey)
    .withRpc(rpcUrl);

  return irysUploader;
}

export async function exportAllData(): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};

  // Export all tables (excluding invitation code related data)
  const tables = [
    { name: 'activeLogs', table: schema.activeLogs },
    { name: 'itemProposals', table: schema.itemProposals },
    { name: 'likeRecord', table: schema.likeRecords },
    { name: 'notifications', table: schema.notifications },
    { name: 'projectLogs', table: schema.projectLogs },
    { name: 'projects', table: schema.projects },
    { name: 'proposals', table: schema.proposals },
    { name: 'voteRecords', table: schema.voteRecords },
    { name: 'lists', table: schema.lists },
    { name: 'listProjects', table: schema.listProjects },
    { name: 'listFollows', table: schema.listFollows },
    { name: 'projectRelations', table: schema.projectRelations },
    { name: 'projectSnaps', table: schema.projectSnaps },
    { name: 'ranks', table: schema.ranks },
    { name: 'shareLinks', table: schema.shareLinks },
  ];

  for (const { name, table } of tables) {
    try {
      console.log(`Exporting ${name}...`);
      const records = await db.select().from(table);
      data[name] = records;
      console.log(`Exported ${records.length} records from ${name}`);
    } catch (error) {
      console.error(`Error exporting ${name}:`, error);
      data[name] = [];
    }
  }

  // Export profiles table with invitation_code_id filtered out
  try {
    console.log('Exporting profiles (filtering invitation_code_id)...');
    const profileRecords = await db.select().from(schema.profiles);

    // Remove invitationCodeId field from each record
    const filteredProfiles = profileRecords.map((profile) => {
      const { invitationCodeId, ...filteredProfile } = profile;
      return filteredProfile;
    });

    data['profiles'] = filteredProfiles;
    console.log(`Exported ${filteredProfiles.length} filtered profile records`);
  } catch (error) {
    console.error('Error exporting profiles:', error);
    data['profiles'] = [];
  }

  return data;
}

export async function createBackupArchive(
  data: Record<string, any[]>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Add backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: Object.keys(data),
      totalRecords: Object.values(data).reduce(
        (sum, records) => sum + records.length,
        0,
      ),
    };

    archive.append(JSON.stringify(metadata, null, 2), {
      name: 'metadata.json',
    });

    // Add each table's data
    for (const [tableName, records] of Object.entries(data)) {
      archive.append(JSON.stringify(records, null, 2), {
        name: `${tableName}.json`,
      });
    }

    archive.finalize();
  });
}

// Store manifest IDs in environment variables or database
const MANIFEST_IDS = {
  dev: process.env.IRYS_MANIFEST_ID_DEV,
  production: process.env.IRYS_MANIFEST_ID_PROD,
};

export async function uploadToIrysFolder(
  data: Buffer,
  filename: string,
): Promise<{
  id: string;
  url: string;
  filename: string;
  manifestId: string;
  folderUrl: string;
}> {
  const uploader = await initializeIrys();
  const env = process.env.NEXT_PUBLIC_ENV || 'dev';

  // First upload the file
  const tags = [
    { name: 'Content-Type', value: 'application/zip' },
    { name: 'App-Name', value: 'ECF-Pensieve-Backup' },
    { name: 'Backup-Type', value: 'Database-Full' },
    { name: 'Environment', value: env },
    { name: 'Timestamp', value: new Date().toISOString() },
    { name: 'Filename', value: filename },
  ];

  const fileReceipt = await uploader.upload(data, { tags });
  console.log(`File uploaded: ${fileReceipt.id}`);

  // Get or create manifest ID for this environment
  let manifestId = MANIFEST_IDS[env as keyof typeof MANIFEST_IDS];

  if (!manifestId) {
    // Create new folder for first time
    console.log('Creating new backup folder...');
    const folderMap = new Map();
    folderMap.set(filename, fileReceipt.id);

    const manifest = await uploader.uploader.generateFolder({
      items: folderMap,
    });

    // Upload the manifest
    const manifestTags = [
      { name: 'Type', value: 'manifest' },
      { name: 'Content-Type', value: 'application/x.irys-manifest+json' },
    ];
    const manifestReceipt = await uploader.upload(JSON.stringify(manifest), {
      tags: manifestTags,
    });
    manifestId = manifestReceipt.id;

    console.log(`New folder created with manifest ID: ${manifestId}`);
    console.log(`Please add this to your environment variables:`);
    console.log(
      `${env === 'production' ? 'IRYS_MANIFEST_ID_PROD' : 'IRYS_MANIFEST_ID_DEV'}=${manifestId}`,
    );
  } else {
    // Add file to existing folder (mutable folder)
    console.log(`Adding file to existing folder: ${manifestId}`);

    try {
      // Step 1: Download the latest mutable manifest
      const response = await fetch(
        `https://gateway.irys.xyz/mutable/${manifestId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch original manifest');
      const originalManifest = await response.json();

      // Step 2: Append new file to the manifest
      originalManifest.paths[filename] = { id: fileReceipt.id };

      console.log(
        `Updated manifest will contain ${Object.keys(originalManifest.paths).length} files`,
      );

      // Step 3: Upload the updated manifest with Root-TX tag
      const manifestTags = [
        { name: 'Type', value: 'manifest' },
        { name: 'Content-Type', value: 'application/x.irys-manifest+json' },
        { name: 'Root-TX', value: manifestId },
      ];

      const manifestReceipt = await uploader.upload(
        JSON.stringify(originalManifest),
        { tags: manifestTags },
      );
      console.log(`Updated manifest uploaded: ${manifestReceipt.id}`);
      console.log(
        `Access mutable folder at: https://gateway.irys.xyz/mutable/${manifestId}`,
      );
    } catch (error) {
      console.error('Error updating mutable manifest:', error);
      // Fallback: create new manifest with just the new file
      const folderMap = new Map();
      folderMap.set(filename, fileReceipt.id);
      const manifest = await uploader.uploader.generateFolder({
        items: folderMap,
      });

      const manifestTags = [
        { name: 'Type', value: 'manifest' },
        { name: 'Content-Type', value: 'application/x.irys-manifest+json' },
        { name: 'Root-TX', value: manifestId },
      ];
      await uploader.upload(JSON.stringify(manifest), { tags: manifestTags });
    }
  }

  const folderUrl = `https://gateway.irys.xyz/mutable/${manifestId}`;
  const fileUrl = `https://gateway.irys.xyz/mutable/${manifestId}/${filename}`;

  return {
    id: fileReceipt.id,
    url: fileUrl,
    filename: filename,
    manifestId: manifestId!,
    folderUrl: folderUrl,
  };
}

export async function performBackup(): Promise<{
  success: boolean;
  id?: string;
  url?: string;
  filename?: string;
  manifestId?: string;
  folderUrl?: string;
  error?: string;
  autoFunded?: boolean;
  metadata?: {
    timestamp: string;
    totalRecords: number;
    size: number;
    sizeInMB: string;
    uploadCost: string;
  };
}> {
  try {
    console.log('Starting database backup...');

    // Check Irys balance and auto-fund if needed
    const uploader = await initializeIrys();
    const balance = await uploader.getBalance();
    const balanceInEth = parseFloat(uploader.utils.fromAtomic(balance));

    console.log(`Current Irys balance: ${balanceInEth} ETH`);

    const autoFunded = false;
    if (balanceInEth < 0.001) {
      console.log(
        `Balance too low (${balanceInEth} ETH), but auto-funding is disabled. Please fund manually.`,
      );
      return {
        success: false,
        error: `Insufficient Irys balance: ${balanceInEth} ETH. Please fund your account manually first.`,
      };
    }

    // Generate filename with timestamp and environment
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now
      .toISOString()
      .split('T')[1]
      .split('.')[0]
      .replace(/:/g, '-'); // HH-MM-SS
    const timestamp = `${dateStr}_${timeStr}`;

    const env = process.env.NEXT_PUBLIC_ENV || 'dev';
    const filename =
      env === 'production'
        ? `ecf-pensieve-backup-${timestamp}.zip`
        : `ecf-pensieve-backup-${env}-${timestamp}.zip`;

    const data = await exportAllData();
    const archiveBuffer = await createBackupArchive(data);

    // Get upload price before uploading
    const priceInfo = await getUploadPrice(archiveBuffer.length);
    console.log(`Upload size: ${priceInfo.sizeInMB} MB`);
    console.log(`Upload cost: ${priceInfo.price} ${priceInfo.currency}`);

    const uploadResult = await uploadToIrysFolder(archiveBuffer, filename);

    const totalRecords = Object.values(data).reduce(
      (sum, records) => sum + records.length,
      0,
    );

    console.log(`Backup completed successfully: ${uploadResult.url}`);
    console.log(`Filename: ${filename}`);

    return {
      success: true,
      id: uploadResult.id,
      url: uploadResult.url,
      filename: uploadResult.filename,
      manifestId: uploadResult.manifestId,
      folderUrl: uploadResult.folderUrl,
      autoFunded,
      metadata: {
        timestamp: now.toISOString(),
        totalRecords,
        size: archiveBuffer.length,
        sizeInMB: priceInfo.sizeInMB,
        uploadCost: priceInfo.price,
      },
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkBalance(): Promise<{
  balance: string;
  currency: string;
}> {
  const uploader = await initializeIrys();
  const balance = await uploader.getBalance();
  return {
    balance: uploader.utils.fromAtomic(balance),
    currency: 'ETH',
  };
}

export async function getUploadPrice(sizeInBytes: number): Promise<{
  price: string;
  currency: string;
  sizeInMB: string;
}> {
  const uploader = await initializeIrys();
  const price = await uploader.getPrice(sizeInBytes);
  return {
    price: uploader.utils.fromAtomic(price),
    currency: 'ETH',
    sizeInMB: (sizeInBytes / 1024 / 1024).toFixed(2),
  };
}

export async function fundAccount(amount: number): Promise<{
  success: boolean;
  txId?: string;
  amount?: string;
  error?: string;
}> {
  try {
    const uploader = await initializeIrys();
    const fundTx = await uploader.fund(uploader.utils.toAtomic(amount));

    return {
      success: true,
      txId: fundTx.id,
      amount: uploader.utils.fromAtomic(fundTx.quantity),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

type ManifestResponse = {
  manifest?: string;
  version?: string;
  paths?: Record<string, { id: string }>;
};

function parseTimestampFromFilename(filename: string): string | undefined {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [_, date, hour, minute, second] = match;
  return `${date}T${hour}:${minute}:${second}Z`;
}

export async function getLatestBackupInfo(): Promise<null | {
  manifestId: string;
  folderUrl: string;
  totalBackups: number;
  latestBackup?: {
    filename: string;
    url: string;
    txId: string;
    timestamp?: string;
    sizeBytes?: number;
    sizeInMB?: string;
  };
}> {
  const env = process.env.NEXT_PUBLIC_ENV || 'dev';
  const manifestId = MANIFEST_IDS[env as keyof typeof MANIFEST_IDS];

  if (!manifestId) {
    return null;
  }

  const manifestUrl = `https://gateway.irys.xyz/mutable/${manifestId}?cache=0`;

  try {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }

    const manifestJson = (await response.json()) as ManifestResponse;
    const paths = manifestJson.paths ?? {};
    const entries = Object.entries(paths);

    if (entries.length === 0) {
      return {
        manifestId,
        folderUrl: `https://gateway.irys.xyz/mutable/${manifestId}`,
        totalBackups: 0,
      };
    }

    let latestEntry = entries[0];
    for (const entry of entries.slice(1)) {
      if (entry[0] > latestEntry[0]) {
        latestEntry = entry;
      }
    }

    const [filename, info] = latestEntry;
    const fileUrl = `https://gateway.irys.xyz/mutable/${manifestId}/${filename}`;

    let sizeBytes: number | undefined;
    try {
      const headResponse = await fetch(fileUrl, { method: 'HEAD' });
      if (headResponse.ok) {
        const sizeHeader = headResponse.headers.get('content-length');
        if (sizeHeader) {
          const parsed = Number(sizeHeader);
          if (!Number.isNaN(parsed)) {
            sizeBytes = parsed;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch backup HEAD metadata:', error);
    }

    return {
      manifestId,
      folderUrl: `https://gateway.irys.xyz/mutable/${manifestId}`,
      totalBackups: entries.length,
      latestBackup: {
        filename,
        url: fileUrl,
        txId: info.id,
        timestamp: parseTimestampFromFilename(filename),
        sizeBytes,
        sizeInMB: sizeBytes ? (sizeBytes / 1024 / 1024).toFixed(2) : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to fetch latest backup info:', error);
    return null;
  }
}
