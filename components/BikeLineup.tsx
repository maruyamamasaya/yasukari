import React, { useState } from "react";
import Link from "next/link";
import { BikeModel } from "../lib/bikes";

const categories = [
  { label: "401cc以上", value: 0 },
  { label: "251〜400cc", value: 1 },
  { label: "126〜250cc", value: 2 },
  { label: "51〜125cc", value: 3 },
  { label: "50cc以下", value: 4 },
];

function parseDisplacement(bike: BikeModel): number | null {
  const text = bike.spec?.displacement || bike.description;
  if (!text) return null;
  const m = text.match(/([0-9]+)cm/);
  return m ? parseInt(m[1], 10) : null;
}

function getCategory(cc: number | null): number {
  if (cc === null) return 2; // default 126〜250cc
  if (cc <= 50) return 4;
  if (cc <= 125) return 3;
  if (cc <= 250) return 2;
  if (cc <= 400) return 1;
  return 0;
}

export default function BikeLineup({ bikes }: { bikes: BikeModel[] }) {
  const [filter, setFilter] = useState<number>(2);
  const filtered = bikes.filter((b) => getCategory(parseDisplacement(b)) === filter);
  return (
    <section className="bike-lineup my-5">
      <h2 className="bike-lineup-title">
        BIKE LINE UP
        <span className="bike-lineup-subtitle">バイクラインアップ</span>
      </h2>
      <div className="bike-lineup-radio-group">
        {categories.map((c, idx) => (
          <label key={idx} className="bike-lineup-radio">
            <input
              type="radio"
              name="cc"
              value={c.value}
              checked={filter === c.value}
              onChange={() => setFilter(c.value)}
            />
            <span className="bike-lineup-radio-text" dangerouslySetInnerHTML={{ __html: c.label.replace("〜", "<br class='sp'>") }} />
          </label>
        ))}
      </div>
      <div className="bike-lineup-scroll">
        <div className="bike-lineup-list">
          {filtered.map((b) => (
            <div key={b.modelCode} className="bike-lineup-card">
              <Link href={`/products/${b.modelCode}`}> 
                <img src={b.img} alt={b.modelName} className="bike-lineup-image" />
                {b.badge && <div className="bike-lineup-badge">{b.badge}</div>}
                <div className="bike-lineup-info">
                  <h3 className="bike-lineup-name" dangerouslySetInnerHTML={{ __html: b.modelName.replace(/\\n/g, '<br>') }} />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Link href="/products" className="bike-lineup-link">
        排気量別一覧を見る
      </Link>
    </section>
  );
}
