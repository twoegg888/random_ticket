export type ChargeProduct = {
  productCode: string;
  amount: number;
  bonus: number;
  points: number;
  label: string;
};

export const CHARGE_PRODUCTS: ChargeProduct[] = [
  { productCode: 'charge_100', amount: 100, bonus: 0, points: 100, label: 'TEST' },
  { productCode: 'charge_10000', amount: 10000, bonus: 0, points: 10000, label: '' },
  { productCode: 'charge_30000', amount: 30000, bonus: 0, points: 30000, label: '' },
  { productCode: 'charge_50000', amount: 50000, bonus: 5000, points: 55000, label: '' },
  { productCode: 'charge_100000', amount: 100000, bonus: 12000, points: 112000, label: '인기' },
  { productCode: 'charge_200000', amount: 200000, bonus: 30000, points: 230000, label: '' },
  { productCode: 'charge_300000', amount: 300000, bonus: 55000, points: 355000, label: '' },
  { productCode: 'charge_400000', amount: 400000, bonus: 100000, points: 500000, label: '추천' },
  { productCode: 'charge_500000', amount: 500000, bonus: 125000, points: 625000, label: '한정 이벤트' },
];
