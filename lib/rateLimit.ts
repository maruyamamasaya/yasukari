// Simple in-memory rate limiter shared across middleware and API routes
export interface ClientInfo {
  count: number;
  first: number;
  blockedUntil?: number;
  failCount: number;
  failFirst: number;
}

const clients = new Map<string, ClientInfo>();

export function getClients(): [string, ClientInfo][] {
  return Array.from(clients.entries());
}

function getInfo(ip: string): ClientInfo {
  const now = Date.now();
  let info = clients.get(ip);
  if (!info) {
    info = { count: 0, first: now, failCount: 0, failFirst: now };
    clients.set(ip, info);
  }
  return info;
}

export function checkAccess(ip: string): boolean {
  const now = Date.now();
  let info = getInfo(ip);

  if (info.blockedUntil && now >= info.blockedUntil) {
    clearBlock(ip);
    info = getInfo(ip);
  }

  if (info.blockedUntil && now < info.blockedUntil) {
    return true;
  }

  // Count requests in a 5 second window
  const bucketStart = now - (now % 5000);
  if (bucketStart !== info.first) {
    info.first = bucketStart;
    info.count = 1;
  } else {
    info.count += 1;
  }

  if (info.count > 100) {
    info.blockedUntil = now + 60_000;
    info.count = 0;
    return true;
  }

  return false;
}

export function recordLoginResult(ip: string, success: boolean): boolean {
  const now = Date.now();
  let info = getInfo(ip);

  if (info.blockedUntil && now >= info.blockedUntil) {
    clearBlock(ip);
    info = getInfo(ip);
  }

  if (info.blockedUntil && now < info.blockedUntil) {
    return true;
  }

  if (success) {
    info.failCount = 0;
  } else {
    if (now - info.failFirst > 5000) {
      info.failFirst = now;
      info.failCount = 1;
    } else {
      info.failCount += 1;
    }
    if (info.failCount >= 5) {
      info.blockedUntil = now + 60_000;
      info.failCount = 0;
      return true;
    }
  }

  return info.blockedUntil !== undefined && now < info.blockedUntil;
}

export function isBlocked(ip: string): boolean {
  const info = clients.get(ip);
  return info ? info.blockedUntil !== undefined && Date.now() < info.blockedUntil : false;
}

export function clearBlock(ip: string): void {
  clients.delete(ip);
}
