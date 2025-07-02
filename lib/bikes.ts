export interface BikeModel {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
  description?: string;
  price24h?: string;
}

/**
 * Fetch list of bike models.
 * In the future this will read from DynamoDB.
 */
export async function getBikeModels(): Promise<BikeModel[]> {
  // Sample data for development
  return [
    {
      modelName: "\u30C9\u30E9\u30C3\u30B0\u30B9\u30BF\u30FC250",
      modelCode: "dragstar250",
      img: "https://yasukari.com/storage/models/DXD10WTKLvRB45VWYVtm.jpg",
      price24h: "7,980\u5186",
    },
    {
      modelName: "クロスカブ110",
      modelCode: "crosscub110",
      img: "https://yasukari.com/storage/models/yIj7Bnk5KSgr05pITe8y.jpg",
      price24h: "6,980円",
      description: "排気量：109cm3 シート高：784mm",
    },
    {
      modelName: "CB400SFV\u30DC\u30EB\u30C9\u30FC\u30EB",
      modelCode: "cb400sfv",
      img: "https://yasukari.com/storage/models/nXUvT7KLr38W99F5xmqy.jpg",
      price24h: "11,980\u5186",
    },
    {
      modelName: "CB1300SF\u30DC\u30EB\u30C9\u30FC\u30EB",
      modelCode: "cb1300sf",
      img: "https://yasukari.com/storage/models/nP97p32L9F4o2mL4TtX6.jpg",
      price24h: "14,980\u5186",
    },
    {
      modelName: "CBR400R",
      modelCode: "cbr400r",
      img: "https://yasukari.com/storage/models/c9kas47ob2ulkaeppka0.jpg",
      price24h: "11,980\u5186",
    },
    {
      modelName: "CT125ハンターカブ",
      modelCode: "ct125",
      img: "https://yasukari.com/storage/models/cescbjb1qb75lhmssvi0.jpg",
      description: "排気量：124cm3 シート高：800mm",
      badge: "人気",
    },
    {
      modelName: "グロム125",
      modelCode: "grom125",
      img: "https://yasukari.com/storage/models/PeJtT9J2MZ5zDdtlf12T.jpg",
      description: "排気量：123cm3 シート高：761mm",
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
      modelName: "SR400",
      modelCode: "sr400",
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=60",
    },
    {
      modelName: "\u30C8\u30A5\u30C7\u30A4-2",
      modelCode: "today2",
      img: "https://yasukari.com/storage/models/chzPCoSkTibLXYsrMN93.jpg",
      description: "\u6392\u6C17\u91CF\uff1a49cm3 \u30B7\u30FC\u30C8\u9AD8\uff1a695mm",
    },
    {
      modelName: "\u30BF\u30AF\u30C8\u3000\u30D9\u30FC\u30B7\u30C3\u30AF",
      modelCode: "tact-basic",
      img: "https://yasukari.com/storage/models/cai2v0vob2uptbmdc4n0.jpg",
      description: "\u6392\u6C17\u91CF\uff1a49cm3 \u30B7\u30FC\u30C8\u9AD8\uff1a720mm",
    },
    {
      modelName: "リトルカブ -E",
      modelCode: "littlecub-e",
      img: "https://yasukari.com/storage/models/cuo67fb1qb717lh4v1tg.JPG",
      description: "排気量：49cm3 シート高：705mm",
    },
    {
      modelName: "エイプ",
      modelCode: "ape",
      img: "https://yasukari.com/storage/models/cuo4qlr1qb717lh4v1q0.JPG",
      description: "排気量：49cm3 シート高：715mm",
    },
    {
      modelName: "C50",
      modelCode: "c50",
      img: "https://yasukari.com/storage/models/cunc5sb1qb717lh4v1ag.JPG",
      description: "排気量：48cm3 シート高：735mm",
    },
    {
      modelName: "PCX",
      modelCode: "pcx",
      img: "https://yasukari.com/storage/models/7sglRumMZg96OY4jtMvr.jpg",
      description: "排気量：125cm3 シート高：764mm",
    },
    {
      modelName: "トリシティ",
      modelCode: "tricity",
      img: "https://yasukari.com/storage/models/Xkaefo1byEdK32othKb7.jpg",
      description: "排気量：124cm3 シート高：765mm",
    },
  ];
}
