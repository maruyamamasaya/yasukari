import type { NextApiRequest, NextApiResponse } from "next";
import {
  ADMIN_BASIC_PASS,
  ADMIN_BASIC_USER,
  isBasicAuthValid,
} from "../../lib/basicAuth";
import {
  readMaintenanceStatus,
  setMaintenanceStatus,
} from "../../lib/server/maintenance";

type MaintenanceResponse = { enabled: boolean } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MaintenanceResponse>
) {
  if (req.method === "GET") {
    const status = await readMaintenanceStatus();
    return res.status(200).json(status);
  }

  if (req.method === "POST") {
    const authorized = isBasicAuthValid(
      req.headers.authorization ?? null,
      ADMIN_BASIC_USER,
      ADMIN_BASIC_PASS
    );

    if (!authorized) {
      res.setHeader("WWW-Authenticate", "Basic realm=\"Protected\"");
      return res.status(401).json({ error: "Auth Required" });
    }

    let body: unknown = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (error) {
        return res.status(400).json({ error: "Request body must be valid JSON" });
      }
    }

    const { enabled } = (body as { enabled?: unknown }) ?? {};

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "'enabled' must be a boolean" });
    }

    await setMaintenanceStatus(enabled);
    return res.status(200).json({ enabled });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
