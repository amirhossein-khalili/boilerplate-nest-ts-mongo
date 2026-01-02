import Redis from 'ioredis';

export async function deleteHashFieldsInBulk(
  redis: Redis,
  hashKey: string,
  fields: string[],
): Promise<void> {
  if (fields.length === 0) return;

  const pipeline = redis.pipeline();
  for (const field of fields) {
    pipeline.hdel(hashKey, field);
  }

  await pipeline.exec();
}


export async function deleteKeysInBulk(
  redis: Redis,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return;

  const pipeline = redis.pipeline();
  for (const key of keys) {
    pipeline.del(key);
  }

  await pipeline.exec();
}

export async function scanKeys(
  redis: Redis,
  pattern: string,
): Promise<string[]> {
  let cursor = '0';
  const keys: string[] = [];
  do {
    const [nextCursor, foundKeys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );
    cursor = nextCursor;
    keys.push(...foundKeys);
  } while (cursor !== '0');
  return keys;
}

export async function hScanFields(
  redis: Redis,
  hashKey: string,
  pattern: string = '*',
): Promise<string[]> {
  let cursor = '0';
  const fields: string[] = [];

  do {
    const [nextCursor, results] = await redis.hscan(
      hashKey,
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );
    cursor = nextCursor;

    for (let i = 0; i < results.length; i += 2) {
      fields.push(results[i]);
    }
  } while (cursor !== '0');

  return fields;
}

export async function patternKeyExists(
  redis: Redis,
  pattern: string,
): Promise<boolean> {
  let cursor = '0';
  do {
    const [nextCursor, foundKeys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );
    if (foundKeys.length > 0) return true;
    cursor = nextCursor;
  } while (cursor !== '0');
  return false;
}
