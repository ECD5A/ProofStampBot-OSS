import { TonClient, WalletContractV5R1, internal, toNano, fromNano } from '@ton/ton';
import { mnemonicToPrivateKey, KeyPair } from '@ton/crypto';
import { config } from './config';
import { beginCell, Address, SendMode } from '@ton/core';
import { createHash } from 'crypto';

let client: TonClient;
let signerWallet: WalletContractV5R1;
let keyPair: KeyPair;
let signerWalletAddress: string;
let payWalletAddress: string;
let payWalletAddressRaw: Address;
let verificationAddresses: Address[] = [];

let sweepInProgress = false;
let sweepBlockedUntil = 0;
const TON_API_RETRY_ATTEMPTS = 8;
const TON_API_RETRY_BASE_MS = 1200;
const TON_API_RETRY_MAX_MS = 12_000;
let walletSendQueue: Promise<void> = Promise.resolve();

type OnchainCommentOptions = {
  postText?: string;
  postTextHash?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function describeAxiosLikeError(error: unknown): string {
  const e = error as any;
  const status = e?.response?.status;
  const code = e?.code;
  const result = e?.response?.data?.result;
  const message = e?.message;

  const parts = [
    status ? `status=${status}` : '',
    code ? `code=${code}` : '',
    result || message || 'unknown error',
  ].filter(Boolean);

  return parts.join(' ');
}

function getHttpStatus(error: unknown): number | undefined {
  return (error as any)?.response?.status;
}

function isRateLimitError(error: unknown): boolean {
  const status = getHttpStatus(error);
  const result = String((error as any)?.response?.data?.result ?? '').toLowerCase();
  return status === 429 || result.includes('ratelimit');
}

function backoffMs(attempt: number): number {
  const exp = TON_API_RETRY_BASE_MS * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 350);
  return Math.min(TON_API_RETRY_MAX_MS, exp + jitter);
}

async function withWalletSendLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = walletSendQueue;
  let release: (() => void) | undefined;
  walletSendQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await prev;
  try {
    return await fn();
  } finally {
    release?.();
  }
}

function readCommentFromInMessage(tx: any): string | undefined {
  try {
    if (!tx?.inMessage?.body) return undefined;
    const slice = tx.inMessage.body.beginParse();
    if (slice.remainingBits < 32) return undefined;
    const op = slice.loadUint(32);
    if (op !== 0) return undefined;
    return slice.loadStringTail();
  } catch {
    return undefined;
  }
}

async function withTonApiRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isRateLimitError(error) || attempt >= TON_API_RETRY_ATTEMPTS - 1) {
        throw error;
      }
      const waitMs = backoffMs(attempt);
      console.warn(`[TON] ${label}: 429 rate limit, retry in ${waitMs}ms (${attempt + 1}/${TON_API_RETRY_ATTEMPTS})`);
      await sleep(waitMs);
      attempt += 1;
    }
  }
}

function normalizeSha256(value: string): string {
  const v = (value || '').trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(v)) {
    throw new Error('Invalid SHA-256 hex');
  }
  return v;
}

function isProofCommentForHash(comment: string, targetHash: string): boolean {
  const normalized = comment.trim().toLowerCase();
  const isProofStampFormat =
    normalized.startsWith(`proofstamp sha256:${targetHash}`) ||
    normalized.startsWith(`proofstamp\nsha256:${targetHash}`) ||
    normalized.startsWith(`proofstamp\npost sha256:${targetHash}`);
  const isPsFormat = normalized.startsWith(`ps|sha256:${targetHash}|o:`);
  const isLegacyProofstamp = normalized.startsWith('proofstamp|') && normalized.includes(targetHash);
  const isLegacyRussian = comment.startsWith('цифровая печать|') && comment.includes(targetHash);
  const isLegacyMojibake = comment.startsWith('С†РёС„СЂРѕРІР°СЏ РїРµС‡Р°С‚СЊ|') && comment.includes(targetHash);
  const isLegacySimple = comment === `notarize:${targetHash}`;
  return isProofStampFormat || isPsFormat || isLegacyProofstamp || isLegacyRussian || isLegacyMojibake || isLegacySimple;
}

function toBigIntSafe(value: unknown): bigint | undefined {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value)) return BigInt(value);
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return BigInt(value.trim());
  return undefined;
}

function readIncomingPayment(tx: any, expectedDestRaw: string): { amountNano: bigint; comment: string } | null {
  try {
    const inMessage = tx?.inMessage;
    const info = inMessage?.info;
    if (!info || info.type !== 'internal') return null;

    const destRaw = info.dest?.toRawString?.();
    if (!destRaw || destRaw !== expectedDestRaw) return null;

    const amountNano = toBigIntSafe(info.value?.coins);
    if (amountNano === undefined) return null;

    const comment = readCommentFromInMessage(tx);
    if (!comment) return null;

    return { amountNano, comment };
  } catch {
    return null;
  }
}

export function buildOnchainComment(documentHash: string, options?: OnchainCommentOptions): string {
  const docHash = normalizeSha256(documentHash);
  const postText = typeof options?.postText === 'string' ? options.postText.replace(/\r\n?/g, '\n') : '';
  if (!postText.trim()) {
    return `ProofStamp\nSHA256:${docHash}`;
  }

  const textHash = options?.postTextHash
    ? normalizeSha256(options.postTextHash)
    : createHash('sha256').update(postText, 'utf8').digest('hex');

  return `ProofStamp\nPost SHA256:${docHash}\nText SHA256:${textHash}\n\nPost text:\n${postText}`;
}

export async function initTon(): Promise<void> {
  const endpoint =
    config.tonNetwork === 'mainnet'
      ? 'https://toncenter.com/api/v2/jsonRPC'
      : 'https://testnet.toncenter.com/api/v2/jsonRPC';

  client = new TonClient({
    endpoint,
    apiKey: config.toncenterApiKey || undefined,
  });

  const mn = config.tonSignerMnemonic;
  if (!mn) throw new Error('TON_SIGNER_MNEMONIC is missing. Set it in .env (24 words).');
  const mnemonic = mn.split(' ').filter(Boolean);
  if (mnemonic.length !== 24) {
    throw new Error('TON_SIGNER_MNEMONIC must contain exactly 24 words.');
  }

  keyPair = await mnemonicToPrivateKey(mnemonic);
  const networkGlobalId = config.tonNetwork === 'mainnet' ? -239 : -3;
  signerWallet = WalletContractV5R1.create({
    publicKey: keyPair.publicKey,
    walletId: {
      networkGlobalId,
      context: {
        workchain: 0,
        walletVersion: 'v5r1',
        subwalletNumber: 0,
      },
    },
  });

  signerWalletAddress = signerWallet.address.toString({
    bounceable: false,
    testOnly: config.tonNetwork === 'testnet',
  });

  if (config.tonPayWalletAddress) {
    try {
      payWalletAddressRaw = Address.parse(config.tonPayWalletAddress);
    } catch {
      throw new Error('Invalid TON_PAY_WALLET_ADDRESS');
    }
  } else {
    payWalletAddressRaw = signerWallet.address;
  }

  payWalletAddress = payWalletAddressRaw.toString({
    bounceable: false,
    testOnly: config.tonNetwork === 'testnet',
  });

  const byRaw = new Map<string, Address>();
  byRaw.set(payWalletAddressRaw.toRawString(), payWalletAddressRaw);
  byRaw.set(signerWallet.address.toRawString(), signerWallet.address);
  verificationAddresses = Array.from(byRaw.values());

  console.log(`TON pay wallet address: ${payWalletAddress}`);
  if (payWalletAddressRaw.toRawString() !== signerWallet.address.toRawString()) {
    console.log(`TON signer wallet address: ${signerWalletAddress}`);
  }

  if (config.treasuryAddress && config.sweepIntervalSec > 0) {
    setInterval(() => {
      maybeSweepToTreasury('timer').catch(() => {});
    }, config.sweepIntervalSec * 1000);
  }
}

export function getWalletAddress(): string {
  return payWalletAddress;
}

export async function sendNotarizationTx(
  documentHash: string,
  options?: OnchainCommentOptions,
  amountTon = 0.1
): Promise<string> {
  return withWalletSendLock(async () => {
    const contract = client.open(signerWallet);
    const seqno = await withTonApiRetry('sendNotarizationTx/getSeqno', () => contract.getSeqno());

    const comment = buildOnchainComment(documentHash, options);
    const payload = beginCell().storeUint(0, 32).storeStringTail(comment).endCell();

    await withTonApiRetry('sendNotarizationTx/sendTransfer', () =>
      contract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        messages: [
          internal({
            to: signerWallet.address,
            value: toNano(String(amountTon)),
            body: payload,
            bounce: false,
          }),
        ],
      })
    );

    let attempts = 0;
    while (attempts < 30) {
      await sleep(2000);
      const newSeqno = await withTonApiRetry('sendNotarizationTx/pollSeqno', () => contract.getSeqno());
      if (newSeqno > seqno) break;
      attempts++;
    }

    const txs = await withTonApiRetry('sendNotarizationTx/getTransactions', () =>
      client.getTransactions(signerWallet.address, { limit: 20 })
    );
    const matched = txs.find((tx: any) => readCommentFromInMessage(tx) === comment);
    if (matched) return matched.hash().toString('hex');
    if (txs.length > 0) return txs[0].hash().toString('hex');
    throw new Error('Transaction not found after sending');
  });
}

export async function verifyDocumentHash(documentHash: string): Promise<{ found: boolean; txHash?: string; timestamp?: number }> {
  const targetHash = normalizeSha256(documentHash);
  const pageSize = 100;
  const maxScan = 1000;

  try {
    for (const address of verificationAddresses) {
      let scanned = 0;
      let lt: string | undefined;
      let hash: string | undefined;
      const seen = new Set<string>();

      while (scanned < maxScan) {
        const limit = Math.min(pageSize, maxScan - scanned);
        const txs = await withTonApiRetry('verifyDocumentHash/getTransactions', () =>
          client.getTransactions(address, { limit, lt, hash })
        );
        if (txs.length === 0) break;

        for (const tx of txs) {
          const txHashHex = tx.hash().toString('hex');
          if (seen.has(txHashHex)) continue;
          seen.add(txHashHex);

          try {
            const comment = readCommentFromInMessage(tx);
            if (!comment) continue;
            if (isProofCommentForHash(comment, targetHash)) {
              return { found: true, txHash: txHashHex, timestamp: tx.now };
            }
          } catch {
            // ignore malformed messages
          }
        }

        scanned += txs.length;
        const last = txs[txs.length - 1];
        const nextLt = last.lt.toString();
        const nextHash = last.hash().toString('base64');
        if (lt === nextLt && hash === nextHash) break;
        lt = nextLt;
        hash = nextHash;
        if (txs.length < limit) break;
      }
    }

    return { found: false };
  } catch (error) {
    console.error(`Error verifying hash: ${describeAxiosLikeError(error)}`);
    throw error;
  }
}

export async function verifyTonPayment(
  documentHash: string,
  minTonAmount = config.tonPrice
): Promise<{ found: boolean; txHash?: string; timestamp?: number; underpaid?: boolean }> {
  const targetHash = normalizeSha256(documentHash);
  const pageSize = 100;
  const maxScan = 1000;
  const expectedDestRaw = payWalletAddressRaw.toRawString();
  const minAmountNano = BigInt(Math.max(0, Math.floor(minTonAmount * 1e9)));
  let underpaid = false;

  try {
    let scanned = 0;
    let lt: string | undefined;
    let hash: string | undefined;
    const seen = new Set<string>();

    while (scanned < maxScan) {
      const limit = Math.min(pageSize, maxScan - scanned);
      const txs = await withTonApiRetry('verifyTonPayment/getTransactions', () =>
        client.getTransactions(payWalletAddressRaw, { limit, lt, hash })
      );
      if (txs.length === 0) break;

      for (const tx of txs) {
        const txHashHex = tx.hash().toString('hex');
        if (seen.has(txHashHex)) continue;
        seen.add(txHashHex);

        const incoming = readIncomingPayment(tx, expectedDestRaw);
        if (!incoming) continue;
        if (!isProofCommentForHash(incoming.comment, targetHash)) continue;
        if (incoming.amountNano < minAmountNano) {
          underpaid = true;
          continue;
        }

        return { found: true, txHash: txHashHex, timestamp: tx.now };
      }

      scanned += txs.length;
      const last = txs[txs.length - 1];
      const nextLt = last.lt.toString();
      const nextHash = last.hash().toString('base64');
      if (lt === nextLt && hash === nextHash) break;
      lt = nextLt;
      hash = nextHash;
      if (txs.length < limit) break;
    }

    return underpaid ? { found: false, underpaid: true } : { found: false };
  } catch (error) {
    console.error(`Error verifying TON payment: ${describeAxiosLikeError(error)}`);
    throw error;
  }
}

export function getTonviewerUrl(txHash: string): string {
  const base = config.tonNetwork === 'mainnet' ? 'https://tonviewer.com' : 'https://testnet.tonviewer.com';
  return `${base}/transaction/${txHash}`;
}

export async function maybeSweepToTreasury(reason: string = 'periodic'): Promise<{ swept: boolean; sentNano?: bigint; txHash?: string }> {
  if (sweepInProgress) return { swept: false };
  if (Date.now() < sweepBlockedUntil) return { swept: false };
  sweepInProgress = true;

  try {
    return await withWalletSendLock(async () => {
      if (!config.treasuryAddress) return { swept: false };

      const contract = client.open(signerWallet);
      const balance: bigint = await withTonApiRetry('sweep/getBalance', () => client.getBalance(signerWallet.address));

      const reserve = toNano(config.opReserveTon);
      const margin = toNano(config.sweepMarginTon);
      const keep = reserve + margin;

      if (balance <= keep) return { swept: false };

      const sendAmount = balance - keep;
      const treasury = Address.parse(config.treasuryAddress);
      const sweepComment = 'TON Auto Sweep Executed';
      const seqno = await withTonApiRetry('sweep/getSeqno', () => contract.getSeqno());

      await withTonApiRetry('sweep/sendTransfer', () =>
        contract.sendTransfer({
          seqno,
          secretKey: keyPair.secretKey,
          sendMode: SendMode.PAY_GAS_SEPARATELY,
          messages: [
            internal({
              to: treasury,
              value: sendAmount,
              bounce: false,
              body: beginCell().storeUint(0, 32).storeStringTail(sweepComment).endCell(),
            }),
          ],
        })
      );

      let attempts = 0;
      while (attempts < 30) {
        await sleep(2000);
        const newSeqno = await withTonApiRetry('sweep/pollSeqno', () => contract.getSeqno());
        if (newSeqno > seqno) break;
        attempts++;
      }

      const txs = await withTonApiRetry('sweep/getTransactions', () =>
        client.getTransactions(signerWallet.address, { limit: 20 })
      );
      const matched = txs.find((tx: any) => readCommentFromInMessage(tx) === sweepComment);
      const txHash = matched ? matched.hash().toString('hex') : txs[0]?.hash().toString('hex');

      console.log(`[SWEEP] Sent ${fromNano(sendAmount)} TON to treasury. Reason=${reason}`);
      return { swept: true, sentNano: sendAmount, txHash };
    });
  } catch (e) {
    const status = getHttpStatus(e);
    if (status === 429) {
      sweepBlockedUntil = Date.now() + config.sweepBackoffSec * 1000;
      console.warn(`[SWEEP] TON API rate limit (429). Backoff ${config.sweepBackoffSec}s.`);
      return { swept: false };
    }
    console.error(`[SWEEP] Error: ${describeAxiosLikeError(e)}`);
    return { swept: false };
  } finally {
    sweepInProgress = false;
  }
}


