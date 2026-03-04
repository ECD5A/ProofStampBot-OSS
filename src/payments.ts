import { config } from './config';
import { getWalletAddress, buildOnchainComment } from './ton';
import { t } from './i18n';

export function createStarsInvoice(userId: number, hashToken: string, sessionId?: string) {
  const payload = sessionId ? `ps:std:${hashToken}:${sessionId}` : `ps:std:${hashToken}`;

  return {
    title: t(userId, 'invoice_title'),
    description: t(userId, 'invoice_description'),
    payload,
    currency: 'XTR',
    prices: [{ label: t(userId, 'invoice_label'), amount: config.starsPrice }],
  };
}

export function createTonConnectLink(documentHash: string): string {
  const addr = getWalletAddress();
  const amount = Math.floor(config.tonPrice * 1e9); // nanotons
  const text = encodeURIComponent(buildOnchainComment(documentHash));
  return `ton://transfer/${addr}?amount=${amount}&text=${text}`;
}
