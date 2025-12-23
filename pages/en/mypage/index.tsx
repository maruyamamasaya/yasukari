import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { RegistrationData } from '../../../types/registration';
import { REQUIRED_REGISTRATION_FIELDS } from '../../../types/registration';
import type { Reservation } from '../../../lib/reservations';

type SessionUser = {
  id: string;
  email?: string;
  username?: string;
};

type UserAttributes = {
  phone_number?: string;
  'custom:handle'?: string;
  'custom:locale'?: string;
  name?: string;
};

export default function MyPageEn() {
  const manualVideoUrl = process.env.NEXT_PUBLIC_MANUAL_VIDEO_URL ?? '/help#manual-video';
  const paymentInfoUrl = process.env.NEXT_PUBLIC_PAYMENT_INFO_URL ?? '/help#payment-info';
  const rentalContractUrl = process.env.NEXT_PUBLIC_RENTAL_CONTRACT_URL ?? '/help#rental-contract';

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [attributes, setAttributes] = useState<UserAttributes | null>(null);
  const [attributesError, setAttributesError] = useState('');
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [registrationError, setRegistrationError] = useState('');
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsError, setReservationsError] = useState('');
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load profile');
        }

        const data = (await response.json()) as { user?: SessionUser };
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('Failed to confirm your session. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchUser();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchAttributes = async () => {
      try {
        const response = await fetch('/api/user/attributes', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load attributes');
        }

        const data = (await response.json()) as { attributes?: UserAttributes };
        setAttributes(data.attributes ?? {});
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setAttributesError('Could not load your profile details. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingAttributes(false);
        }
      }
    };

    void fetchAttributes();
    return () => controller.abort();
  }, [loading, router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchRegistration = async () => {
      try {
        const response = await fetch('/api/register/user', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (response.status === 404) {
          setRegistration(null);
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load registration');
        }

        const data = (await response.json()) as { registration?: RegistrationData | null };
        setRegistration(data.registration ?? null);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setRegistrationError('Could not load your full registration. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRegistration(false);
        }
      }
    };

    void fetchRegistration();
    return () => controller.abort();
  }, [loading, router]);

  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations/me', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401) {
          await router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('failed to load reservations');
        }

        const data = (await response.json()) as { reservations?: Reservation[] };
        const allReservations = data.reservations ?? [];
        const canceledReservations = allReservations.filter(
          (reservation) => reservation.status === 'キャンセル'
        );
        const activeReservations = allReservations.filter((reservation) => {
          const isCompleted =
            reservation.reservationCompletedFlag || reservation.status === '予約完了';
          return !isCompleted && reservation.status !== 'キャンセル';
        });

        if (canceledReservations.length > 0 && typeof window !== 'undefined') {
          const storageKey = 'yasukari-cancelled-reservation-ids';
          let seenIds: string[] = [];

          try {
            const stored = window.localStorage.getItem(storageKey);
            if (stored) {
              const parsed = JSON.parse(stored) as unknown;
              if (Array.isArray(parsed)) {
                seenIds = parsed.filter((value): value is string => typeof value === 'string');
              }
            }
          } catch (storageError) {
            console.warn('Failed to parse cancelled reservation cache', storageError);
          }

          const canceledIds = canceledReservations.map((reservation) => reservation.id);
          const unseenIds = canceledIds.filter((id) => !seenIds.includes(id));

          if (unseenIds.length > 0) {
            setShowCancelNotice(true);
          }

          const mergedIds = Array.from(new Set([...seenIds, ...canceledIds]));
          window.localStorage.setItem(storageKey, JSON.stringify(mergedIds));
        }

        setReservations(activeReservations);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setReservationsError('Could not load your reservations. Please try again later.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingReservations(false);
        }
      }
    };

    void fetchReservations();
    return () => controller.abort();
  }, [loading, router]);

  const localeLabel = (value: string | undefined) => {
    if (!value) return 'Not set';
    if (value.toLowerCase().startsWith('jp')) return 'Japanese region';
    if (value.toLowerCase().startsWith('en')) return 'English-speaking region';
    return value;
  };

  const sexLabel = (value: string | undefined) => {
    if (value === '1') return 'Male';
    if (value === '2') return 'Female';
    return 'Not set';
  };

  const isRegistrationComplete = useMemo(() => {
    if (!registration) return false;
    return REQUIRED_REGISTRATION_FIELDS.every((field) => Boolean(registration[field]));
  }, [registration]);

  const formatReservationDatetime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';

    return parsed.toLocaleString('en-US', {
      timeZone: 'Asia/Tokyo',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reservationCompletionLabel = (flag: boolean) => (flag ? 'Reservation complete' : 'In use');

  const markVehicleChangeSeen = async (reservationId: string) => {
    try {
      await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleChangeNotified: true }),
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, vehicleChangeNotified: true } : reservation
        )
      );
    } catch (error) {
      console.error('Failed to mark vehicle change as seen', error);
    }
  };

  useEffect(() => {
    reservations.forEach((reservation) => {
      if (reservation.vehicleChangedAt && !reservation.vehicleChangeNotified) {
        void markVehicleChangeSeen(reservation.id);
      }
    });
  }, [reservations]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        throw new Error(`failed to logout: ${response.status}`);
      }

      await router.replace('/login');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Failed to log out. Please try again later.');
      setLoggingOut(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Page</title>
      </Head>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2 text-sm text-gray-600">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/en" className="text-red-600 hover:underline">
                  Home
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-600">My Page</li>
            </ol>
          </nav>
          <h1 className="text-2xl font-semibold text-gray-900">My Page</h1>
          <p className="text-sm text-gray-500">View and manage your current profile details.</p>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Roadside assistance guidance</p>
                <p className="mt-2">
                  If your bike breaks down while riding within 180 km of the rental store, you can use our 24/7 roadside assistance
                  at no extra cost. Please call the store during business hours, or contact roadside assistance directly outside
                  business hours.
                </p>
                <p className="mt-2 font-semibold">Roadside assistance contact: 0120-024-024</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">Checking your sign-in status…</p>
          </section>
        ) : (
          <>
            {error ? (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-sm text-red-700">{error}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
                  <p className="mt-1 text-sm text-gray-600">Your latest bookings and usage will appear here.</p>
                </div>
                <Link
                  href="/en/mypage/past-reservations"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Past reservations
                </Link>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {reservationsError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{reservationsError}</p>
                ) : loadingReservations ? (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">Loading reservation data…</p>
                ) : reservations.length === 0 ? (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                    You have no active reservations right now. Completed bookings are listed under Past reservations.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {reservations.map((reservation) => (
                      <li
                        key={reservation.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-100"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500">ID: {reservation.id}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {reservation.storeName} / {reservation.vehicleModel}
                            </p>
                            <p className="text-xs text-gray-600">{reservation.vehicleCode} {reservation.vehiclePlate}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                              {reservation.status}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${reservation.reservationCompletedFlag ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}
                            >
                              {reservationCompletionLabel(reservation.reservationCompletedFlag)}
                            </span>
                          </div>
                        </div>
                        {reservation.vehicleChangedAt && !reservation.vehicleChangeNotified && (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                            The vehicle has been changed by the administrator. New vehicle: {reservation.vehicleCode} /{' '}
                            {reservation.vehiclePlate || 'Not set'}
                          </p>
                        )}
                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">Pickup → Return</dt>
                            <dd className="font-semibold text-gray-900">
                              {formatReservationDatetime(reservation.pickupAt)} → {formatReservationDatetime(reservation.returnAt)}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">Reservation details</dt>
                            <dd className="font-semibold text-gray-900">
                              Vehicle code: {reservation.vehicleCode || '-'} / Plate number: {reservation.vehiclePlate || 'Not set'}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">Payment amount</dt>
                            <dd className="font-semibold text-gray-900">{reservation.paymentAmount} yen</dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">Payment date</dt>
                            <dd className="font-semibold text-gray-900">
                              {reservation.paymentDate ? formatReservationDatetime(reservation.paymentDate) : 'Not recorded'}
                            </dd>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <dt className="text-xs text-gray-500">Completion date (storage only)</dt>
                            <dd className="font-semibold text-gray-900">
                              {reservation.rentalCompletedAt ? formatReservationDatetime(reservation.rentalCompletedAt) : 'Not set'}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={manualVideoUrl}
                            className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Watch manual video
                          </Link>
                          <Link
                            href={paymentInfoUrl}
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Check payment info
                          </Link>
                          <Link
                            href={rentalContractUrl}
                            className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View rental contract
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile information</h2>
                </div>
                <Link
                  href="/en/mypage/profile-setup"
                  className="inline-flex items-center rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:text-red-800"
                >
                  Edit basic info
                </Link>
              </div>

              {attributesError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{attributesError}</p>
              ) : null}

              {loadingAttributes ? (
                <p className="mt-3 text-sm text-gray-700">Loading your profile…</p>
              ) : attributes ? (
                <dl className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-600">Phone number</dt>
                    <dd className="mt-1 text-gray-800">{attributes.phone_number ?? 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Handle name</dt>
                    <dd className="mt-1 text-gray-800">{attributes['custom:handle'] ?? 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Location / language</dt>
                    <dd className="mt-1 text-gray-800">{localeLabel(attributes['custom:locale'])}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Name</dt>
                    <dd className="mt-1 text-gray-800">{attributes.name ?? 'Not set'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-gray-700">We couldn&apos;t load your profile details.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Full registration</h2>
                  <p className="mt-1 text-sm text-gray-600">Enter the required details for rentals.</p>
                  {loadingRegistration ? null : registration ? (
                    isRegistrationComplete ? (
                      <p className="mt-2 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                        Registration complete
                      </p>
                    ) : (
                      <p className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                        Registration incomplete
                      </p>
                    )
                  ) : (
                    <p className="mt-2 inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                      No registration saved yet
                    </p>
                  )}
                </div>
                <Link
                  href="/en/mypage/registration"
                  className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Go to registration form
                </Link>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {registrationError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{registrationError}</p>
                ) : null}

                {loadingRegistration ? (
                  <p>Loading your registration details…</p>
                ) : registration ? (
                  <div className="space-y-3">
                    {!isRegistrationComplete ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                        Some required fields are missing. Please review and complete your registration.
                      </p>
                    ) : null}
                    <dl className="grid gap-4 md:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">Name</dt>
                        <dd className="mt-1 text-gray-900">{`${registration.name1} ${registration.name2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">Furigana</dt>
                        <dd className="mt-1 text-gray-900">{`${registration.kana1} ${registration.kana2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">Gender</dt>
                        <dd className="mt-1 text-gray-900">{sexLabel(registration.sex)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">Address</dt>
                        <dd className="mt-1 text-gray-900">{`〒${registration.zip} ${registration.address1} ${registration.address2}`}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">Birthday</dt>
                        <dd className="mt-1 text-gray-900">{registration.birth}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-500">License number</dt>
                        <dd className="mt-1 text-gray-900">{registration.license ? 'Registered (number hidden)' : 'Not registered'}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                    No registration details yet. Please fill out the form to proceed.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
                  <p className="mt-1 text-sm text-gray-600">Recent bookings and usage will appear here.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
                  Coming soon
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                  Reservation status will be displayed here once the feature is ready. Thank you for your patience.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Log out</h2>
              <p className="mt-2 text-sm text-gray-600">
                Logging out will hide My Page until you sign in again.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                disabled={!user || loggingOut}
              >
                {loggingOut ? 'Processing…' : 'Log out'}
              </button>
            </section>
          </>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Helpful links</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>
              <Link className="text-red-600 hover:underline" href="/en/pricing">
                View pricing
              </Link>
            </li>
            <li>
              <Link className="text-red-600 hover:underline" href="/en/help">
                Help center
              </Link>
            </li>
          </ul>
        </section>
      </main>
      {showCancelNotice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Reservation cancellation notice</h2>
            <p className="mt-3 text-sm text-gray-700">
              Your reservation has been marked as cancelled by our staff. If you have any
              questions, please contact support.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              onClick={() => setShowCancelNotice(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
