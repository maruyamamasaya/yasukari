import type { NextApiRequest, NextApiResponse } from "next";

import { fetchMembers } from "../../../../lib/adminMembers";

type MembersResponse = {
  members: Awaited<ReturnType<typeof fetchMembers>>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const members = await fetchMembers();
    const response: MembersResponse = { members };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch members", error);
    const message =
      error instanceof Error ? error.message : "会員情報の取得に失敗しました。";
    return res.status(500).json({ message });
  }
}
