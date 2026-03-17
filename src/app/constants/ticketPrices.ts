// 티켓 카테고리별 가격 (포인트)
export const TICKET_PRICES = {
  ruby: 9900,
  jewelry: 19900,
  meat: 39900,
  beauty: 24900,
  platinum: 99000,
  diamond: 49000,
  gold: 14900,
} as const;

export type TicketType = keyof typeof TICKET_PRICES;