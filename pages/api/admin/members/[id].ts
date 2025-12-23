import type { NextApiRequest, NextApiResponse } from "next";

import { fetchMemberDetail } from "../../../../lib/adminMembers";

type MemberDetailResponse = Awaited<ReturnType<typeof fetchMemberDetail>>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const memberId = Array.isArray(id) ? id[0] : id;

  if (!memberId) {
    return res.status(400).json({ message: "会員IDが指定されていません。" });
  }

  try {
    const detail = await fetchMemberDetail(memberId);
    if (!detail.member) {
      return res.status(404).json({ message: "会員情報が見つかりませんでした。" });
    }
    const response: MemberDetailResponse = detail;
    return res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch member detail", error);
    const message =
      error instanceof Error ? error.message : "会員詳細の取得に失敗しました。";
    return res.status(500).json({ message });
  }
}
