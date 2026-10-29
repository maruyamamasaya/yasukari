jest.mock('../lib/keyboxLogs', () => ({
  addKeyboxLog: jest.fn(async (log) => log),
}));
jest.mock('../lib/keyboxUpdateEmail', () => ({ sendKeyboxUpdateEmail: jest.fn() }));
jest.mock('../lib/reservations', () => ({
  fetchReservationsByMember: jest.fn(),
  isActiveReservation: jest.fn(() => true),
  updateReservation: jest.fn(),
}));

describe('KEYBOX manual reissue validity', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.KEYBOX_API_KEY;
  const originalSecretKey = process.env.KEYBOX_SECRET_KEY;

  beforeEach(() => {
    jest.resetModules();
    process.env.KEYBOX_API_KEY = 'mock-api-key';
    process.env.KEYBOX_SECRET_KEY = 'mock-secret-key';
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        code: '0', msg: 'success', data: { pinId: 'mock-pin', qrCode: 'mock-qr' },
      }),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.KEYBOX_API_KEY;
    else process.env.KEYBOX_API_KEY = originalApiKey;
    if (originalSecretKey === undefined) delete process.env.KEYBOX_SECRET_KEY;
    else process.env.KEYBOX_SECRET_KEY = originalSecretKey;
    jest.clearAllMocks();
  });

  it.each([
    ['2026-10-19T11:00:00+09:00', '2026-10-20T11:00:00+09:00',
      '2026-10-19T01:00:00.000Z', '2026-10-20T03:00:00.000Z'],
    ['2026-10-17T22:00', '2026-10-18T22:00',
      '2026-10-17T12:00:00.000Z', '2026-10-18T14:00:00.000Z'],
  ])('sends and saves the buffered Japanese-time window for %s', async (start, end, expectedStart, expectedEnd) => {
    const { default: handler } = require('../pages/api/admin/keybox-reissue');
    const { fetchReservationsByMember, updateReservation } = require('../lib/reservations');
    const { addKeyboxLog } = require('../lib/keyboxLogs');
    const { sendKeyboxUpdateEmail } = require('../lib/keyboxUpdateEmail');
    fetchReservationsByMember.mockResolvedValue([{ id: 'reservation-1', storeName: '三ノ輪店' }]);
    updateReservation.mockImplementation(async (id: string, updates: object) => ({ id, ...updates }));
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };

    await handler({ method: 'POST', body: {
      windowStart: start, windowEnd: end, memberId: 'member-1', unitId: 'mock-unit',
    } }, response);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      unitId: 'mock-unit',
      sTime: String(Date.parse(expectedStart) / 1000),
      eTime: String(Date.parse(expectedEnd) / 1000),
    });
    const window = { windowStart: expectedStart, windowEnd: expectedEnd };
    expect(addKeyboxLog).toHaveBeenCalledWith(expect.objectContaining(window));
    expect(updateReservation).toHaveBeenCalledWith('reservation-1', expect.objectContaining({
      keyboxWindowStart: expectedStart, keyboxWindowEnd: expectedEnd,
    }));
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ ...window, success: true }));
    expect(sendKeyboxUpdateEmail).toHaveBeenCalledWith(expect.objectContaining({
      id: 'reservation-1', keyboxWindowStart: expectedStart, keyboxWindowEnd: expectedEnd,
    }));
  });

  it('keeps a successful QR update when notification delivery fails and reports a warning', async () => {
    const { default: handler } = require('../pages/api/admin/keybox-reissue');
    const { fetchReservationsByMember, updateReservation } = require('../lib/reservations');
    const { sendKeyboxUpdateEmail } = require('../lib/keyboxUpdateEmail');
    fetchReservationsByMember.mockResolvedValue([{ id: 'reservation-1', storeName: '三ノ輪店' }]);
    updateReservation.mockResolvedValue({ id: 'reservation-1' });
    sendKeyboxUpdateEmail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn(), setHeader: jest.fn() };
    try {
      await handler({ method: 'POST', body: {
        windowStart: '2026-10-19T11:00', windowEnd: '2026-10-20T11:00', memberId: 'member-1',
      } }, response);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true, message: expect.stringContaining('更新通知メールを送信できませんでした'),
      }));
    } finally {
      errorLog.mockRestore();
    }
  });

  it('keeps automatic reservation issuance at one hour before and after', async () => {
    const { issueKeyboxPinForReservation } = require('../lib/keybox');
    const result = await issueKeyboxPinForReservation({
      id: 'reservation-1', pickupAt: '2026-10-19T11:00:00+09:00',
      returnAt: '2026-10-20T11:00:00+09:00',
    });
    expect(result.reservationUpdates).toMatchObject({
      keyboxWindowStart: '2026-10-19T01:00:00.000Z',
      keyboxWindowEnd: '2026-10-20T03:00:00.000Z',
    });
  });
});
