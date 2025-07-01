import { useEffect, useState } from 'react';
import Head from 'next/head';

interface ClientEntry {
  0: string;
  1: {
    count: number;
    first: number;
    blockedUntil?: number;
    failCount: number;
    failFirst: number;
  };
}

export default function MonitorPage() {
  const [data, setData] = useState<ClientEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/monitor');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="p-4">
      <Head>
        <title>Rate Limit Monitor</title>
      </Head>
      <h1 className="text-xl font-bold mb-4">Rate Limit Monitor</h1>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2">IP</th>
            <th className="border px-2">Count</th>
            <th className="border px-2">First</th>
            <th className="border px-2">FailCount</th>
            <th className="border px-2">BlockedUntil</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([ip, info]) => (
            <tr key={ip}>
              <td className="border px-2">{ip}</td>
              <td className="border px-2 text-right">{info.count}</td>
              <td className="border px-2">
                {new Date(info.first).toLocaleTimeString()}
              </td>
              <td className="border px-2 text-right">{info.failCount}</td>
              <td className="border px-2">
                {info.blockedUntil
                  ? new Date(info.blockedUntil).toLocaleTimeString()
                  : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
