export interface BikeModel {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
  description?: string;
}

/**
 * Fetch list of bike models.
 * In the future this will read from DynamoDB.
 */
export async function getBikeModels(): Promise<BikeModel[]> {
  // Sample data for development
  return [
    {
      modelName: "CT125 \u30CF\u30F3\u30BF\u30FC\u30AB\u30D6",
      modelCode: "ct125",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=60",
      badge: "\u4EBA\u6C17",
    },
    {
      modelName: "Rebel 250",
      modelCode: "rebel250",
      img: "https://images.unsplash.com/photo-1527059815533-5e3217fe272b?auto=format&fit=crop&w=400&q=60",
      badge: "\u65B0\u7740",
    },
    {
      modelName: "Monkey 125",
      modelCode: "monkey125",
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "GB350",
      modelCode: "gb350",
      img: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "CB400 Super Four",
      modelCode: "cb400sf",
      img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "Ninja 400",
      modelCode: "ninja400",
      img: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "MT-25",
      modelCode: "mt25",
      img: "https://images.unsplash.com/photo-1558980664-10abf19c5c99?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "GSX-S125",
      modelCode: "gsxs125",
      img: "https://images.unsplash.com/photo-1521033630360-8da27f438aab?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "Super Cub 110",
      modelCode: "supercub110",
      img: "https://images.unsplash.com/photo-1541290166853-cc98c362c88a?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "SR400",
      modelCode: "sr400",
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=60",
    },
  ];
}
