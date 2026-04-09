import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function required(name: string, value: string | undefined): string {
  const v = (value ?? '').trim();
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function asNumber(name: string, value: string | undefined, fallback: number): number {
  const v = (value ?? '').trim();
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${name}: ${value}`);
  return n;
}

function asInt(name: string, value: string | undefined, fallback: number): number {
  const n = asNumber(name, value, fallback);
  return Math.trunc(n);
}

function asBool(name: string, value: string | undefined, fallback: boolean): boolean {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  throw new Error(`Invalid boolean for ${name}: ${value}`);
}

type PricingSection = {
  stars: number;
  ton: number;
  anchorTon: number;
};

type PricingConfig = {
  standard: PricingSection;
  postText: PricingSection;
};

function parsePricingNumber(section: string, field: 'stars' | 'ton' | 'anchorTon', value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid pricing value for ${section}.${field}`);
  }
  return field === 'stars' ? Math.trunc(n) : n;
}

function loadPricingConfig(): PricingConfig {
  const pricingPath = path.resolve(__dirname, '..', 'config', 'pricing.json');
  let raw: unknown;

  try {
    raw = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load pricing config from ${pricingPath}: ${reason}`);
  }

  const data = raw as Partial<Record<'standard' | 'postText', Partial<Record<'stars' | 'ton' | 'anchorTon', unknown>>>>;
  if (!data?.standard || !data?.postText) {
    throw new Error(`Invalid pricing config structure in ${pricingPath}`);
  }

  return {
    standard: {
      stars: parsePricingNumber('standard', 'stars', data.standard.stars),
      ton: parsePricingNumber('standard', 'ton', data.standard.ton),
      anchorTon: parsePricingNumber('standard', 'anchorTon', data.standard.anchorTon ?? data.standard.ton),
    },
    postText: {
      stars: parsePricingNumber('postText', 'stars', data.postText.stars),
      ton: parsePricingNumber('postText', 'ton', data.postText.ton),
      anchorTon: parsePricingNumber('postText', 'anchorTon', data.postText.anchorTon ?? data.postText.ton),
    },
  };
}

const pricing = loadPricingConfig();
const starsPrice = pricing.standard.stars;
const tonPrice = pricing.standard.ton;
const starsAnchorTon = pricing.standard.anchorTon;
const starsPostTextPrice = pricing.postText.stars;
const tonPostTextPrice = pricing.postText.ton;
const starsPostTextAnchorTon = pricing.postText.anchorTon;
const maxDocumentMb = Math.max(1, asInt('MAX_DOCUMENT_MB', process.env.MAX_DOCUMENT_MB, 20));
const groupStampModeRaw = (process.env.GROUP_STAMP_MODE || 'manual').trim().toLowerCase();
if (!['auto', 'manual'].includes(groupStampModeRaw)) {
  throw new Error(`Invalid GROUP_STAMP_MODE: ${process.env.GROUP_STAMP_MODE}`);
}
const groupStampMode = groupStampModeRaw as 'auto' | 'manual';
const groupStampTag = ((process.env.GROUP_STAMP_TAG || '#stamp').trim() || '#stamp').toLowerCase();

export const config = {
  // Secrets (required)
  botToken: required('BOT_TOKEN', process.env.BOT_TOKEN),
  botUsername: (process.env.BOT_USERNAME || '').trim(), // optional but recommended (e.g. ProofStampBot)
  // Backward compatibility: TON_WALLET_MNEMONIC is still accepted.
  tonSignerMnemonic: (process.env.TON_SIGNER_MNEMONIC || process.env.TON_WALLET_MNEMONIC || '').trim(),
  tonPayWalletAddress: (process.env.TON_PAY_WALLET_ADDRESS || '').trim(),
  toncenterApiKey: (process.env.TONCENTER_API_KEY || '').trim(),

  tonNetwork: (process.env.TON_NETWORK || 'mainnet') as 'mainnet' | 'testnet',

  // Pricing from repo config/pricing.json
  starsPrice,
  tonPrice,
  starsAnchorTon,
  starsPostTextPrice,
  tonPostTextPrice,
  starsPostTextAnchorTon,

  // Compatibility aliases
  starsStandard: starsPrice,
  tonStandard: tonPrice,

  // Service
  port: asInt('PORT', process.env.PORT, 3000),

  // TON funds management (wallet sweep)
  treasuryAddress: (process.env.TREASURY_ADDRESS || '').trim(),
  opReserveTon: (process.env.OP_RESERVE_TON || '3').trim(), // keep 3 TON by default
  sweepMarginTon: (process.env.SWEEP_MARGIN_TON || '0.1').trim(),
  sweepIntervalSec: asInt('SWEEP_INTERVAL_SEC', process.env.SWEEP_INTERVAL_SEC, 60),
  sweepBackoffSec: asInt('SWEEP_BACKOFF_SEC', process.env.SWEEP_BACKOFF_SEC, 180),
  sweepAfterPayment: asBool('SWEEP_AFTER_PAYMENT', process.env.SWEEP_AFTER_PAYMENT, false),

  // Housekeeping
  pendingTtlMinutes: asInt('PENDING_TTL_MINUTES', process.env.PENDING_TTL_MINUTES, 30),
  maxDocumentMb,
  maxDocumentBytes: maxDocumentMb * 1024 * 1024,
  fileFetchTimeoutSec: Math.max(5, asInt('FILE_FETCH_TIMEOUT_SEC', process.env.FILE_FETCH_TIMEOUT_SEC, 60)),
  dropPendingUpdates: asBool('DROP_PENDING_UPDATES', process.env.DROP_PENDING_UPDATES, false),
  channelStampEnabled: asBool('CHANNEL_STAMP_ENABLED', process.env.CHANNEL_STAMP_ENABLED, true),
  channelStampPinProof: asBool('CHANNEL_STAMP_PIN_PROOF', process.env.CHANNEL_STAMP_PIN_PROOF, false),
  groupStampMode,
  groupStampTag,

  // CAPTCHA
  captchaTtlMinutes: asInt('CAPTCHA_TTL_MINUTES', process.env.CAPTCHA_TTL_MINUTES, 1440),
};

if (!['mainnet', 'testnet'].includes(config.tonNetwork)) {
  throw new Error(`Invalid TON_NETWORK: ${config.tonNetwork}`);
}

// Safety: don't allow placeholder token
if (config.botToken.includes('placeholder_token_change_me')) {
  throw new Error('BOT_TOKEN looks like a placeholder. Set real BOT_TOKEN in .env');
}

// Safety: mnemonic is always required.
if (!config.tonSignerMnemonic) {
  throw new Error('Missing required env var: TON_SIGNER_MNEMONIC (or legacy TON_WALLET_MNEMONIC)');
}

// Safety: auto-generation mode is disabled by design.
if (config.tonSignerMnemonic === 'generate_new') {
  throw new Error(
    'TON_SIGNER_MNEMONIC=generate_new is disabled. Set a real 24-word mnemonic in .env.'
  );
}

if ((process.env.ALLOW_GENERATE_WALLET || '').trim()) {
  throw new Error(
    'ALLOW_GENERATE_WALLET is not supported anymore. Remove it and set a real TON_SIGNER_MNEMONIC.'
  );
}
