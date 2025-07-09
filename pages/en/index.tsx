import React from 'react';
import Head from 'next/head';

export default function HomeEn() {
  return (
    <>
      <Head>
        <title>yasukari - Motorcycle Rentals</title>
      </Head>
      <main className="py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to yasukari</h1>
        <p>This is the English version of our top page.</p>
        <p className="mt-2">More translated content is coming soon.</p>
      </main>
    </>
  );
}
