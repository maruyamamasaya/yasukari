#!/usr/bin/env node
// Default is read-only. No user data, image URLs or signed URLs are logged.
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetPublicAccessBlockCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

async function main() {
  if (process.argv.includes('--help')) {
    console.log('LICENSE_UPLOADS_BUCKET=... USER_TABLE=... AWS_REGION=ap-northeast-1 node scripts/migrate-license-images.cjs [--apply]');
    console.log('Default: read-only validation. --apply: conditionally replace legacy license URLs with keys in the same bucket. Back up DynamoDB first.');
    return;
  }
  const apply = process.argv.includes('--apply');
  const bucket = process.env.LICENSE_UPLOADS_BUCKET;
  const table = process.env.USER_TABLE;
  const region = process.env.AWS_REGION || 'ap-northeast-1';
  const prefix = (process.env.LICENSE_UPLOADS_PREFIX || 'LicenseUploads/').replace(/\/*$/, '/');
  if (!bucket || !table) throw new Error('LICENSE_UPLOADS_BUCKET and USER_TABLE must be explicit');
  const s3 = new S3Client({ region });
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
  const block = (await s3.send(new GetPublicAccessBlockCommand({ Bucket: bucket }))).PublicAccessBlockConfiguration;
  if (!block || !['BlockPublicAcls', 'IgnorePublicAcls', 'BlockPublicPolicy', 'RestrictPublicBuckets'].every(k => block[k])) {
    throw new Error('Enable all four bucket Block Public Access settings before migration');
  }
  let cursor, records = 0, changes = 0;
  do {
    const page = await db.send(new ScanCommand({
      TableName: table, ExclusiveStartKey: cursor,
      ProjectionExpression: 'user_id, license_image_url, license_image_url_2, license_image_key, license_image_key_2',
    }));
    for (const item of page.Items || []) {
      records++;
      for (const suffix of ['', '_2']) {
        const field = `license_image_url${suffix}`, target = `license_image_key${suffix}`;
        const old = item[field];
        if (!old) continue;
        const url = new URL(old);
        if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash ||
          ![`${bucket}.s3.${region}.amazonaws.com`, `${bucket}.s3.amazonaws.com`].includes(url.hostname)) {
          throw new Error('Unexpected legacy URL: stopped without logging personal data');
        }
        const key = decodeURIComponent(url.pathname.slice(1));
        if (!key.startsWith(prefix) || key.length <= prefix.length || /[\x00-\x1f\\]/.test(key) || key.split('/').some(p => p === '.' || p === '..') || (item[target] && item[target] !== key)) {
          throw new Error('Invalid key or conflicting record: migration stopped');
        }
        await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        if (apply) await db.send(new UpdateCommand({
          TableName: table, Key: { user_id: item.user_id },
          UpdateExpression: 'SET #target = :key REMOVE #old',
          ConditionExpression: '#old = :old AND (attribute_not_exists(#target) OR #target = :key)',
          ExpressionAttributeNames: { '#target': target, '#old': field },
          ExpressionAttributeValues: { ':key': key, ':old': old },
        }));
        changes++;
      }
    }
    cursor = page.LastEvaluatedKey;
  } while (cursor);
  console.log(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', records, imageFields: changes }));
}
main().catch(() => { console.error('Migration stopped. Check credentials, private bucket configuration, legacy URL consistency and object existence. Earlier conditional updates may have completed; rerunning is safe.'); process.exitCode = 1; });
