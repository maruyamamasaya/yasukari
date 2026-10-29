import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/rental-bike-terms', permanent: true },
});

export default function TermsPage() {
  return null;
}
