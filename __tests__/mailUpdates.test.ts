import { withMyPageLink } from '../lib/mailMyPageLink';
import { sendKeyboxUpdateEmail } from '../lib/keyboxUpdateEmail';
import { enqueueEmail } from '../lib/mailQueue';
import { addMailHistory } from '../lib/mailHistory';
import type { Reservation } from '../lib/reservations';
import { sendReservationCompletionEmail } from '../lib/reservationCompletionEmail';

jest.mock('../lib/mailQueue', () => ({ enqueueEmail: jest.fn() }));
jest.mock('../lib/mailHistory', () => ({ addMailHistory: jest.fn() }));

const reservation = {
  id: 'reservation-1', memberId: 'member-1', memberEmail: 'renter@example.com',
  keyboxWindowStart: '2026-10-19T01:00:00.000Z',
  keyboxWindowEnd: '2026-10-20T03:00:00.000Z',
} as Reservation;

beforeEach(() => jest.clearAllMocks());

test('adds a My page link to both text and complete HTML without duplicating it', () => {
  const result = withMyPageLink({ text: '予約内容', html: '<html><body><p>予約内容</p></body></html>' });
  expect(result.text).toContain('/mypage');
  expect(result.html).toMatch(/href="[^"]+\/mypage"/);
  expect(result.html!.indexOf('/mypage')).toBeLessThan(result.html!.indexOf('</body>'));
  expect(withMyPageLink(result)).toEqual(result);
});

test('preserves plain-text-only mail', () => {
  const result = withMyPageLink({ text: '認証コード: 123456' });
  expect(result.text).toContain('認証コード: 123456');
  expect(result).not.toHaveProperty('html', expect.any(String));
});

test('notifies the reservation owner of the saved QR window in Japan time', async () => {
  expect(await sendKeyboxUpdateEmail(reservation)).toBe(true);
  expect(enqueueEmail).toHaveBeenCalledTimes(1);
  const mail = (enqueueEmail as jest.Mock).mock.calls[0][0];
  expect(mail.to).toBe('renter@example.com');
  expect(mail.userIdForNotification).toBe('member-1');
  expect(mail.text).toContain('2026/10/19 10:00:00');
  expect(mail.text).toContain('2026/10/20 12:00:00');
  expect(mail.text).toContain('/mypage');
  expect(mail.text).toContain('マイページを再読み込み');
});

test('records a skip when the reservation has no recipient', async () => {
  expect(await sendKeyboxUpdateEmail({ ...reservation, memberEmail: '' })).toBe(false);
  expect(enqueueEmail).not.toHaveBeenCalled();
  expect(addMailHistory).toHaveBeenCalledWith(expect.objectContaining({ status: 'skipped' }));
});

test('propagates email failure so the API can report it without retrying QR issuance', async () => {
  (enqueueEmail as jest.Mock).mockRejectedValueOnce(new Error('SMTP unavailable'));
  await expect(sendKeyboxUpdateEmail(reservation)).rejects.toThrow('SMTP unavailable');
});

test('includes the published Minowa procedure article in text and HTML reservation mail', async () => {
  const names = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const previous = names.map(name => process.env[name]);
  try {
    names.forEach(name => { process.env[name] = name === 'SMTP_PORT' ? '587' : 'mock-only'; });
    await sendReservationCompletionEmail({
      ...reservation, storeName: '三ノ輪店', options: {}, accessories: {},
    });
    const mail = (enqueueEmail as jest.Mock).mock.calls[0][0];
    const path = '/blog_for_custmor/2025-09-01-minowa-procedures';
    expect(mail.text).toContain(path);
    expect(mail.html).toContain(path);
    expect(mail.html).toContain('三ノ輪店のご利用案内を見る');
  } finally {
    names.forEach((name, i) => {
      if (previous[i] === undefined) delete process.env[name];
      else process.env[name] = previous[i];
    });
  }
});
