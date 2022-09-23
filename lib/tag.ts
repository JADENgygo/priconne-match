export const order: {
  'rank': number,
  'policy': number,
  'login': number,
  'chat': number,
  'tool': number,
  'battleCount': number,
  'auto': number,
  'equipmentRequest': number,
  'battleDeclaration': number,
  'level': number,
  'strength': number,
  'character': number,
} = {
  'rank': 0,
  'policy': 1,
  'login': 2,
  'chat': 3,
  'tool': 4,
  'battleCount': 5,
  'auto': 6,
  'equipmentRequest': 7,
  'battleDeclaration': 8,
  'level': 9,
  'strength': 10,
  'character': 11,
};

export const tags = [
  {
    name: '順位目標',
    label: 'rank',
    values: [
      '~50位目標',
      '~100位目標',
      '~150位目標',
      '~300位目標',
      '~500位目標',
      '~700位目標',
      '~1000位目標',
      '~1500位目標',
      '~2000位目標',
      '~3000位目標',
      '~4500位目標',
      '~5000位目標',
      '~7000位目標',
      '~10000位目標',
      '~15000位目標',
      '順位目標無し',
    ]
  },
  {
    name: '活動方針',
    label: 'policy',
    values: [
      '自由にプレイ',
      'まったりプレイ',
      'がっつりプレイ',
      '初心者OK',
      'わいわいプレイ',
    ],
  },
  {
    name: 'ログイン',
    label: 'login',
    values: [
      '毎日ログイン',
      '2日以内ログイン',
      '3日以内ログイン',
      '4日以内ログイン',
      '5日以内ログイン',
      '6日以内ログイン',
      '7日以内ログイン',
      '7~日以内ログイン',
      'ログイン制限無し',
    ],
  },
  {
    name: 'チャット',
    label: 'chat',
    values: [
      '無言OK',
      '無言NG',
    ],
  },
  {
    name: 'ツール',
    label: 'tool',
    values: [
      'Discord必須',
      'Discord任意',
      'Twitter必須',
      'Twitter任意',
      'Discord必須/Twitter必須',
      'Discord必須/Twitter任意',
      'Discord任意/Twitter必須',
      '外部ツール無し',
    ],
  },
  {
    name: '凸数',
    label: 'battleCount',
    values: [
      '3凸必須',
      '2凸以上必須',
      '1凸以上必須',
      '凸数任意',
    ],
  },
  {
    name: 'オート設定',
    label: 'auto',
    values: [
      'オートOK',
      'オートNG',
    ],
  },
  {
    name: '装備リク',
    label: 'equipmentRequest',
    values: [
      '装備リクOK',
      '装備リクNG',
    ],
  },
  {
    name: '凸宣言',
    label: 'battleDeclaration',
    values: [
      '凸宣言有り',
      '凸宣言無し',
    ],
  },
  {
    name: 'レベル',
    label: 'level',
    values: [
      '要カンスト',
      'レベル100以上',
      'レベル200以上',
      'レベル制限無し',
    ],
  },
  {
    name: '全キャラ戦力',
    label: 'strength',
    values: [
      '戦力200万以上',
      '戦力100万以上',
      '戦力制限無し',
    ],
  },
  {
    name: '所持キャラ',
    label: 'character',
    values: [
      '所持キャラ確認有り',
      '所持キャラ不問',
    ],
  }
];
