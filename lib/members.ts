export type MemberStatus = "認証済" | "未認証" | "退会済み";

export type MemberRole = "一般" | "管理者" | "閲覧のみ";

export type Member = {
  id: string;
  memberNumber: string;
  name: string;
  nameKana: string;
  role: MemberRole;
  email: string;
  status: MemberStatus;
  isInternational: boolean;
  updatedAt: string;
  mobilePhone: string;
  phoneNumber: string;
  birthDate: string;
  postalCode: string;
  address: string;
  licenseNumber: string;
  workplaceName: string;
  workplaceAddress: string;
  workplacePhone: string;
  otherContactName: string;
  otherContactAddress: string;
  otherContactPhone: string;
  registeredAt: string;
  notes: string;
};

export const members: Member[] = [
  {
    id: "cvugscr1qb717lh4va90",
    memberNumber: "cvugscr1qb717lh4va90",
    name: "テスト テスト",
    nameKana: "テスト テスト",
    role: "一般",
    email: "test_001@test.com",
    status: "認証済",
    isInternational: false,
    updatedAt: "2025/11/17 09:03",
    mobilePhone: "08017792001",
    phoneNumber: "08017792001",
    birthDate: "1994-06-01",
    postalCode: "1000003",
    address: "東京都千代田区一ツ橋（１丁目） hitotsubashi",
    licenseNumber: "301234567890",
    workplaceName: "JIMUSURU",
    workplaceAddress: "東京都千代田区一ツ橋（１丁目）",
    workplacePhone: "08017792001",
    otherContactName: "JUMUSURU",
    otherContactAddress: "東京都千代田区一ツ橋（１丁目）",
    otherContactPhone: "08017792001",
    registeredAt: "2025/11/17 09:03",
    notes: "備考を編集",
  },
  {
    id: "cmvn9pb1qb7c2oe4l8e0",
    memberNumber: "cmvn9pb1qb7c2oe4l8e0",
    name: "山田 太郎",
    nameKana: "ヤマダ タロウ",
    role: "管理者",
    email: "taro_yamada@example.com",
    status: "認証済",
    isInternational: true,
    updatedAt: "2025/11/12 14:20",
    mobilePhone: "07010002000",
    phoneNumber: "0335601234",
    birthDate: "1988-02-14",
    postalCode: "1500001",
    address: "東京都渋谷区神宮前1-1-1",
    licenseNumber: "123456789012",
    workplaceName: "Shibuya Office",
    workplaceAddress: "東京都渋谷区神宮前2-2-2",
    workplacePhone: "0364002000",
    otherContactName: "Shibuya Contact",
    otherContactAddress: "東京都渋谷区神宮前3-3-3",
    otherContactPhone: "0312345678",
    registeredAt: "2025/10/05 11:30",
    notes: "重要顧客。出張が多いため海外利用が多いです。",
  },
  {
    id: "cldemo1qb7e2vl0ppx0",
    memberNumber: "cldemo1qb7e2vl0ppx0",
    name: "佐藤 花子",
    nameKana: "サトウ ハナコ",
    role: "閲覧のみ",
    email: "hanako.sato@example.com",
    status: "未認証",
    isInternational: false,
    updatedAt: "2025/11/01 08:10",
    mobilePhone: "08033334444",
    phoneNumber: "0455002000",
    birthDate: "1996-09-09",
    postalCode: "2310005",
    address: "神奈川県横浜市中区本町5-50",
    licenseNumber: "789012345678",
    workplaceName: "Yokohama Office",
    workplaceAddress: "神奈川県横浜市西区みなとみらい2-2-1",
    workplacePhone: "0456809999",
    otherContactName: "Yokohama Contact",
    otherContactAddress: "神奈川県横浜市中区桜木町1-1-1",
    otherContactPhone: "0452221111",
    registeredAt: "2025/09/25 15:05",
    notes: "本人確認書類待ち。",
  },
];
