import type { NextApiRequest, NextApiResponse } from "next";

import { fetchMembers } from "../../../../lib/adminMembers";
import { fetchAllReservations, isActiveReservation } from "../../../../lib/reservations";

type ActiveMembersResponse = {
  members: Awaited<ReturnType<typeof fetchMembers>>;
};

export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse<ActiveMembersResponse | { message: string }>
) {
  try {
    const [members, reservations] = await Promise.all([
      fetchMembers(),
      fetchAllReservations(),
    ]);
    const activeMemberIds = new Set(
      reservations
        .filter((reservation) => reservation.memberId && isActiveReservation(reservation))
        .map((reservation) => reservation.memberId)
    );
    const activeMembers = members.filter((member) => activeMemberIds.has(member.id));
    response.status(200).json({ members: activeMembers });
  } catch (error) {
    console.error("Failed to fetch active members", error);
    response.status(500).json({ message: "現在予約中の会員情報の取得に失敗しました。" });
  }
}
