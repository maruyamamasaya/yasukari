import type { NextApiRequest, NextApiResponse } from "next";

import handler from "../../pages/api/reservations";
import { verifyCognitoIdToken } from "../../lib/cognitoServer";
import { fetchReservationById } from "../../lib/reservations";

jest.mock("../../lib/cognitoServer", () => ({
  verifyCognitoIdToken: jest.fn(),
  COGNITO_ID_TOKEN_COOKIE: "cognito_id_token",
}));

jest.mock("../../lib/reservations", () => ({
  fetchReservationById: jest.fn(),
  fetchAllReservations: jest.fn(),
  createReservation: jest.fn(),
  updateReservation: jest.fn(),
}));

jest.mock("../../lib/dynamodb", () => ({
  getDocumentClient: jest.fn(),
}));

jest.mock("../../lib/keybox", () => ({
  issueKeyboxPinForReservation: jest.fn(),
}));

jest.mock("../../lib/reservationCompletionEmail", () => ({
  sendReservationCompletionEmail: jest.fn(),
}));

const mockReq = (overrides: Partial<NextApiRequest>) => overrides as NextApiRequest;

const mockRes = () => {
  const res = {} as NextApiResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe("POST /api/reservations", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects reservations after 5pm JST on the previous day", async () => {
    (verifyCognitoIdToken as jest.Mock).mockResolvedValue({ sub: "user-1" });
    (fetchReservationById as jest.Mock).mockResolvedValue(null);
    jest.useFakeTimers().setSystemTime(new Date("2026-03-20T08:00:00.000Z"));

    const req = mockReq({
      method: "POST",
      cookies: { cognito_id_token: "token" },
      body: {
        storeName: "足立小台店",
        vehicleModel: "Test Bike",
        vehicleCode: "bike-1",
        pickupDate: "2026-03-21",
        pickupAt: "2026-03-21T01:00:00.000Z",
        returnAt: "2026-03-22T01:00:00.000Z",
        paymentAmount: 10000,
        paymentId: "pay_1",
      },
    });
    const res = mockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "予約受付は日本時間でご利用前日の17:00に締め切られます。前日17:00以降は予約できません。",
    });
    expect(fetchReservationById).not.toHaveBeenCalled();
  });
});
