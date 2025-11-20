import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/login',
    permanent: true,
  },
});

export default function AuthLoginRedirect() {
  return null;
}
