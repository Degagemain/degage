import { Bucket, Storage } from '@google-cloud/storage';

let storageClient: Storage | null = null;
let bucketInstance: Bucket | null = null;

const getStorageClient = (): Storage => {
  if (storageClient) {
    return storageClient;
  }

  const credentialsB64 = process.env.GCP_BUCKET_CREDENTIALS;
  if (credentialsB64?.trim()) {
    const credentials = JSON.parse(Buffer.from(credentialsB64, 'base64').toString('utf8')) as Record<string, unknown>;
    storageClient = new Storage({ credentials });
  } else {
    storageClient = new Storage();
  }

  return storageClient;
};

const getBucketName = (): string => {
  const name = process.env.GCP_BUCKET_NAME;
  if (!name?.trim()) {
    throw new Error('GCP_BUCKET_NAME is not set');
  }
  return name;
};

export const getGcsBucket = (): Bucket => {
  if (bucketInstance) {
    return bucketInstance;
  }
  bucketInstance = getStorageClient().bucket(getBucketName());
  return bucketInstance;
};

export const getSignedUrlTtlSeconds = (): number => {
  const raw = process.env.GCP_BUCKET_SIGNED_URL_TTL_SECONDS;
  if (raw?.trim()) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 3600;
};

export type PutObjectInput = {
  objectKey: string;
  body: Buffer;
  contentType: string;
};

export const putObject = async ({ objectKey, body, contentType }: PutObjectInput): Promise<void> => {
  const file = getGcsBucket().file(objectKey);
  await file.save(body, {
    contentType,
    resumable: false,
  });
};

export const deleteObject = async (objectKey: string): Promise<void> => {
  const file = getGcsBucket().file(objectKey);
  await file.delete({ ignoreNotFound: true });
};

export const getSignedViewUrl = async (objectKey: string, expiresInSeconds?: number): Promise<string> => {
  const file = getGcsBucket().file(objectKey);
  const ttl = expiresInSeconds ?? getSignedUrlTtlSeconds();
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + ttl * 1000,
  });
  return url;
};
