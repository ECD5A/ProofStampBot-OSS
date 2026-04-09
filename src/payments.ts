import { config } from './config';
import { getWalletAddress, buildOnchainComment } from './ton';
import { t } from './i18n';

type TonLinkOptions = {
  postText?: string;
  postTextHash?: string;
};

export function createStarsInvoice(userId: number, hashToken: string, sessionId?: string, starsAmount = config.starsPrice) {
  const payload = sessionId ? `ps:std:${hashToken}:${sessionId}` : `ps:std:${hashToken}`;

  return {
    title: t(userId, 'invoice_title'),
    description: t(userId, 'invoice_description'),
    payload,
    currency: 'XTR',
    prices: [{ label: t(userId, 'invoice_label'), amount: starsAmount }],
  };
}

export function createTonConnectLink(documentHash: string, options?: TonLinkOptions, tonAmount = config.tonPrice): string {
  const addr = getWalletAddress();
  const amount = Math.floor(tonAmount * 1e9); // nanotons
  const text = encodeURIComponent(buildOnchainComment(documentHash, options));
  return `ton://transfer/${addr}?amount=${amount}&text=${text}`;
}
