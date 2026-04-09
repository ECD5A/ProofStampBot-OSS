import { Bot, InlineKeyboard, InputFile, Context } from 'grammy';
import { createHash, randomBytes } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { config } from './config';
import { sendNotarizationTx, verifyDocumentHash, verifyTonPayment, getTonviewerUrl, maybeSweepToTreasury } from './ton';
import { generateCertificate } from './certificate';
import { createStarsInvoice, createTonConnectLink } from './payments';
import { t, setLang, getLang, normalizeLang, Lang } from './i18n';

type SessionState = 'await_owner' | 'await_payment' | 'processing';
type ChannelStampTextMode = 'hash_only' | 'hash_and_text';

type PendingSession = {
  sessionId: string;
  hash: string;
  fileName: string;
  createdAt: number;
  ownerName?: string;
  state: SessionState;
  kind?: 'document' | 'channel_post';
  channelKey?: string;
  channelChatId?: number;
  channelMessageId?: number;
  channelThreadId?: number;
  postTextMode?: ChannelStampTextMode;
  postText?: string;
  postTextHash?: string;
  starsInvoicePayload?: string;
  starsPaid?: boolean;
  starsChargeId?: string;
};

type CaptchaEmojiId = 'apple' | 'cat' | 'car' | 'rocket' | 'star' | 'balloon';
type CaptchaOption = {
  id: CaptchaEmojiId;
  emoji: string;
};

type CaptchaChallenge = {
  target: CaptchaEmojiId;
  expiresAt: number;
};

type CaptchaFailState = {
  streak: number;
  attempts24h: number[];
  blockedUntil: number;
};

type DeferredStartPayload = {
  payload: string;
  createdAt: number;
};

type RateBucket = {
  count: number;
  windowStartedAt: number;
};

type ProcessedStarsStore = {
  charges: Record<string, number>;
  payloads: Record<string, number>;
};

type ParsedStarsPayload = {
  hashToken: string;
  sessionId?: string;
};

type ChannelPostSession = {
  key: string;
  chatId: number;
  messageId: number;
  messageThreadId?: number;
  createdAt: number;
  hash: string;
  fileName: string;
  channelTitle: string;
  postText?: string;
  postTextHash?: string;
  promptMessageId?: number;
};

type ChannelStampRecord = {
  chatId: number;
  messageId: number;
  messageThreadId?: number;
  hash: string;
  txHash: string;
  timestamp: number;
  stampedAt: number;
  proofMessageId?: number;
  fileName: string;
  channelTitle: string;
  textIncluded?: boolean;
  textHash?: string;
};

type ChannelStampStore = Record<string, ChannelStampRecord>;

type ForwardedStampTarget = {
  key: string;
  createdAt: number;
};

type ChannelStampInitResult = 'started' | 'already_done' | 'dm_unavailable';

const pending = new Map<number, PendingSession>();
const awaitingOwner = new Set<number>();
const verifyModeChats = new Set<number>();

const captchaChallenges = new Map<number, CaptchaChallenge>();
const captchaVerifiedUntil = new Map<number, number>();
const captchaFailState = new Map<number, CaptchaFailState>();
const deferredStartPayload = new Map<number, DeferredStartPayload>();
const starsInvoiceIndex = new Map<string, { chatId: number; sessionId: string }>();
const processingPayments = new Set<string>();
const hashJobsInProgress = new Set<number>();
const rateBuckets = new Map<string, RateBucket>();
const MAX_POST_TEXT_TON_BYTES = 1500;
const channelPostSessions = new Map<string, ChannelPostSession>();
const processingChannelStamps = new Set<string>();
const forwardedStampTargets = new Map<number, ForwardedStampTarget>();

const CAPTCHA_OPTIONS: CaptchaOption[] = [
  { id: 'apple', emoji: '🍎' },
  { id: 'cat', emoji: '🐱' },
  { id: 'car', emoji: '🚗' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'star', emoji: '⭐' },
  { id: 'balloon', emoji: '🎈' },
];
const CAPTCHA_CALLBACK_RE = /^captcha_(apple|cat|car|rocket|star|balloon)$/;
const CAPTCHA_CHALLENGE_TTL_MS = 10 * 60_000;
const CAPTCHA_FAIL_WINDOW_MS = 24 * 60 * 60_000;
const CAPTCHA_BLOCK_30_MIN_MS = 30 * 60_000;
const CAPTCHA_BLOCK_60_MIN_MS = 60 * 60_000;
const DEFERRED_START_TTL_MS = 20 * 60_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const PROCESSED_PAYMENT_TTL_MS = 30 * 24 * 60 * 60_000;
const PROCESSED_PAYMENT_MAX_ENTRIES = 20_000;
const CHANNEL_POST_CACHE_TTL_MS = 3 * 24 * 60 * 60_000;
const CHANNEL_STAMP_TTL_MS = 365 * 24 * 60 * 60_000;
const CHANNEL_STAMP_MAX_ENTRIES = 100_000;
const FORWARDED_STAMP_TTL_MS = 60 * 60_000;
const INVISIBLE_MESSAGE = '\u2063';

const processedStarsFile = path.join(process.cwd(), 'data', 'processed-stars-payments.json');
const processedStars = loadProcessedStarsStore();
const channelStampsFile = path.join(process.cwd(), 'data', 'channel-stamps.json');
const channelStamps = loadChannelStampStore();

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadProcessedStarsStore(): ProcessedStarsStore {
  try {
    ensureDataDir();
    if (!fs.existsSync(processedStarsFile)) {
      return { charges: {}, payloads: {} };
    }
    const raw = JSON.parse(fs.readFileSync(processedStarsFile, 'utf8')) as Partial<ProcessedStarsStore>;
    return {
      charges: raw.charges ?? {},
      payloads: raw.payloads ?? {},
    };
  } catch {
    return { charges: {}, payloads: {} };
  }
}

function saveProcessedStarsStore() {
  try {
    ensureDataDir();
    const tmp = `${processedStarsFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(processedStars, null, 2), 'utf8');
    fs.renameSync(tmp, processedStarsFile);
  } catch {
    // ignore storage failures to keep bot alive
  }
}

function loadChannelStampStore(): ChannelStampStore {
  try {
    ensureDataDir();
    if (!fs.existsSync(channelStampsFile)) return {};
    return JSON.parse(fs.readFileSync(channelStampsFile, 'utf8')) as ChannelStampStore;
  } catch {
    return {};
  }
}

function saveChannelStampStore() {
  try {
    ensureDataDir();
    const tmp = `${channelStampsFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(channelStamps, null, 2), 'utf8');
    fs.renameSync(tmp, channelStampsFile);
  } catch {
    // ignore storage failures to keep bot alive
  }
}

function trimRecordByTtlAndSize(record: Record<string, number>, ttlMs: number, maxEntries: number): boolean {
  let changed = false;
  const now = Date.now();

  for (const [key, ts] of Object.entries(record)) {
    if (!Number.isFinite(ts) || now - ts > ttlMs) {
      delete record[key];
      changed = true;
    }
  }

  const entries = Object.entries(record);
  if (entries.length > maxEntries) {
    entries.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < entries.length - maxEntries; i++) {
      delete record[entries[i][0]];
      changed = true;
    }
  }

  return changed;
}

function cleanupProcessedStarsStore() {
  const changedCharges = trimRecordByTtlAndSize(processedStars.charges, PROCESSED_PAYMENT_TTL_MS, PROCESSED_PAYMENT_MAX_ENTRIES);
  const changedPayloads = trimRecordByTtlAndSize(processedStars.payloads, PROCESSED_PAYMENT_TTL_MS, PROCESSED_PAYMENT_MAX_ENTRIES);
  if (changedCharges || changedPayloads) saveProcessedStarsStore();
}

function cleanupChannelStampStore(): void {
  let changed = false;
  const now = Date.now();
  const entries = Object.entries(channelStamps);

  for (const [key, rec] of entries) {
    if (!rec || !Number.isFinite(rec.stampedAt) || now - rec.stampedAt > CHANNEL_STAMP_TTL_MS) {
      delete channelStamps[key];
      changed = true;
    }
  }

  const sorted = Object.entries(channelStamps).sort((a, b) => b[1].stampedAt - a[1].stampedAt);
  if (sorted.length > CHANNEL_STAMP_MAX_ENTRIES) {
    for (let i = CHANNEL_STAMP_MAX_ENTRIES; i < sorted.length; i++) {
      delete channelStamps[sorted[i][0]];
      changed = true;
    }
  }

  if (changed) saveChannelStampStore();
}

function hasProcessedCharge(chargeId: string): boolean {
  if (!chargeId) return false;
  return Boolean(processedStars.charges[chargeId]);
}

function hasProcessedPayload(payload: string): boolean {
  if (!payload) return false;
  return Boolean(processedStars.payloads[payload]);
}

function markPaymentProcessed(chargeId: string, payload: string): void {
  const now = Date.now();
  if (chargeId) processedStars.charges[chargeId] = now;
  if (payload) processedStars.payloads[payload] = now;
  cleanupProcessedStarsStore();
  saveProcessedStarsStore();
}

function setSession(chatId: number, sess: PendingSession): void {
  const prev = pending.get(chatId);
  if (prev?.starsInvoicePayload && prev.starsInvoicePayload !== sess.starsInvoicePayload) {
    starsInvoiceIndex.delete(prev.starsInvoicePayload);
  }
  pending.set(chatId, sess);
  if (sess.starsInvoicePayload) {
    starsInvoiceIndex.set(sess.starsInvoicePayload, { chatId, sessionId: sess.sessionId });
  }
}

function clearPendingSession(chatId: number): void {
  const sess = pending.get(chatId);
  if (sess?.starsInvoicePayload) {
    starsInvoiceIndex.delete(sess.starsInvoicePayload);
  }
  pending.delete(chatId);
  awaitingOwner.delete(chatId);
}

function clearChatState(chatId: number): void {
  clearPendingSession(chatId);
  verifyModeChats.delete(chatId);
}

function findSessionByPayload(payload: string): { chatId: number; sess: PendingSession } | null {
  const indexed = starsInvoiceIndex.get(payload);
  if (indexed) {
    const sess = pending.get(indexed.chatId);
    if (sess && sess.sessionId === indexed.sessionId && sess.starsInvoicePayload === payload) {
      return { chatId: indexed.chatId, sess };
    }
    starsInvoiceIndex.delete(payload);
  }

  for (const [chatId, sess] of pending.entries()) {
    if (sess.starsInvoicePayload === payload) {
      starsInvoiceIndex.set(payload, { chatId, sessionId: sess.sessionId });
      return { chatId, sess };
    }
  }

  return null;
}

function hitRateLimit(scope: string, userId: number, limit: number, windowMs: number): boolean {
  if (limit <= 0) return false;
  const key = `${scope}:${userId}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || now - current.windowStartedAt >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStartedAt: now });
    return false;
  }

  if (current.count >= limit) {
    return true;
  }

  current.count += 1;
  return false;
}

async function replyRateLimited(ctx: Context, userId: number, isCallback: boolean): Promise<void> {
  if (isCallback) {
    await ctx.answerCallbackQuery({ text: t(userId, 'rate_limited') }).catch(() => {});
    return;
  }
  await ctx.reply(t(userId, 'rate_limited')).catch(() => {});
}

function cleanupState() {
  const now = Date.now();
  const pendingTtlMs = config.pendingTtlMinutes * 60_000;
  let processedStoreChanged = false;

  for (const [chatId, sess] of pending.entries()) {
    if (now - sess.createdAt > pendingTtlMs) {
      clearPendingSession(chatId);
    }
  }

  for (const [payload, entry] of starsInvoiceIndex.entries()) {
    const sess = pending.get(entry.chatId);
    if (!sess || sess.sessionId !== entry.sessionId || sess.starsInvoicePayload !== payload) {
      starsInvoiceIndex.delete(payload);
    }
  }

  for (const [userId, challenge] of captchaChallenges.entries()) {
    if (challenge.expiresAt <= now) captchaChallenges.delete(userId);
  }

  for (const [userId, until] of captchaVerifiedUntil.entries()) {
    if (until <= now) captchaVerifiedUntil.delete(userId);
  }

  for (const [userId, state] of captchaFailState.entries()) {
    const attempts24h = (state.attempts24h || []).filter((ts) => now - ts <= CAPTCHA_FAIL_WINDOW_MS);
    const blockedUntil = state.blockedUntil > now ? state.blockedUntil : 0;
    if (attempts24h.length === 0 && blockedUntil === 0) {
      captchaFailState.delete(userId);
      continue;
    }
    captchaFailState.set(userId, {
      streak: state.streak,
      attempts24h,
      blockedUntil,
    });
  }

  for (const [userId, deferred] of deferredStartPayload.entries()) {
    if (now - deferred.createdAt > DEFERRED_START_TTL_MS) deferredStartPayload.delete(userId);
  }

  for (const [key, bucket] of rateBuckets.entries()) {
    if (now - bucket.windowStartedAt > RATE_LIMIT_WINDOW_MS * 2) {
      rateBuckets.delete(key);
    }
  }

  for (const [key, sess] of channelPostSessions.entries()) {
    if (now - sess.createdAt > CHANNEL_POST_CACHE_TTL_MS) {
      channelPostSessions.delete(key);
      processingChannelStamps.delete(key);
    }
  }

  for (const [userId, target] of forwardedStampTargets.entries()) {
    if (now - target.createdAt > FORWARDED_STAMP_TTL_MS) {
      forwardedStampTargets.delete(userId);
    }
  }

  processedStoreChanged ||= trimRecordByTtlAndSize(processedStars.charges, PROCESSED_PAYMENT_TTL_MS, PROCESSED_PAYMENT_MAX_ENTRIES);
  processedStoreChanged ||= trimRecordByTtlAndSize(processedStars.payloads, PROCESSED_PAYMENT_TTL_MS, PROCESSED_PAYMENT_MAX_ENTRIES);
  if (processedStoreChanged) saveProcessedStarsStore();
  cleanupChannelStampStore();
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64');
}

function newSessionId(): string {
  return base64UrlEncode(randomBytes(9));
}

function hashToToken(hashHex: string): string {
  return base64UrlEncode(Buffer.from(hashHex, 'hex')); // 32 bytes -> 43 chars
}

function tokenToHash(token: string): string {
  const buf = base64UrlDecode(token);
  if (buf.length !== 32) throw new Error('Bad token length');
  return buf.toString('hex');
}

function parseStarsPayload(payload: string): ParsedStarsPayload | null {
  const parts = payload.split(':');
  if (parts.length !== 3 && parts.length !== 4) return null;
  if (parts[0] !== 'ps' || parts[1] !== 'std') return null;

  const hashToken = (parts[2] || '').trim();
  const sessionId = (parts[3] || '').trim() || undefined;

  if (!/^[A-Za-z0-9_-]{40,60}$/.test(hashToken)) return null;
  if (sessionId && !/^[A-Za-z0-9_-]{6,40}$/.test(sessionId)) return null;

  return { hashToken, sessionId };
}

function makeChannelStampKey(chatId: number, messageId: number): string {
  return `${chatId}:${messageId}`;
}

function sanitizeAsciiSlug(value: string, maxLen: number): string {
  const clean = (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLen);
  return clean || 'post';
}

function extractChannelPostText(post: any): string | undefined {
  const raw =
    typeof post?.caption === 'string'
      ? post.caption
      : typeof post?.text === 'string'
        ? post.text
        : '';
  const normalized = raw.replace(/\r\n?/g, '\n');
  return normalized.trim() ? normalized : undefined;
}

function hashTextSnapshot(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function toEntityShape(entities: any[] | undefined): Array<Record<string, unknown>> | undefined {
  if (!Array.isArray(entities) || entities.length === 0) return undefined;
  return entities.map((e) => ({
    type: e.type,
    offset: e.offset,
    length: e.length,
    url: e.url,
    user_id: e.user?.id,
    language: e.language,
    custom_emoji_id: e.custom_emoji_id,
  }));
}

function buildChannelMediaShape(post: any): Record<string, unknown> {
  const media: Record<string, unknown> = {};

  if (Array.isArray(post.photo) && post.photo.length > 0) {
    media.photo = post.photo.map((p: any) => p.file_unique_id).filter(Boolean);
  }
  if (post.video?.file_unique_id) media.video = post.video.file_unique_id;
  if (post.animation?.file_unique_id) media.animation = post.animation.file_unique_id;
  if (post.document?.file_unique_id) media.document = post.document.file_unique_id;
  if (post.audio?.file_unique_id) media.audio = post.audio.file_unique_id;
  if (post.voice?.file_unique_id) media.voice = post.voice.file_unique_id;
  if (post.video_note?.file_unique_id) media.video_note = post.video_note.file_unique_id;
  if (post.sticker?.file_unique_id) media.sticker = post.sticker.file_unique_id;
  if (post.poll) {
    media.poll = {
      question: post.poll.question,
      options: Array.isArray(post.poll.options) ? post.poll.options.map((o: any) => ({ text: o.text })) : [],
      is_anonymous: post.poll.is_anonymous,
      type: post.poll.type,
      allows_multiple_answers: post.poll.allows_multiple_answers,
    };
  }

  return media;
}

function buildChannelPostCanonicalPayload(post: any): Record<string, unknown> {
  return {
    v: 1,
    chat_id: post.chat?.id,
    chat_type: post.chat?.type,
    message_id: post.message_id,
    message_thread_id: post.message_thread_id,
    date: post.date,
    from_id: post.from?.id,
    sender_chat_id: post.sender_chat?.id,
    author_signature: post.author_signature,
    text: post.text,
    caption: post.caption,
    entities: toEntityShape(post.entities),
    caption_entities: toEntityShape(post.caption_entities),
    media: buildChannelMediaShape(post),
  };
}

function hashChannelPost(post: any): string {
  const canonical = buildChannelPostCanonicalPayload(post);
  const json = JSON.stringify(canonical);
  return createHash('sha256').update(json).digest('hex');
}

function upsertChannelPostSession(post: any): ChannelPostSession | null {
  const chatId = post?.chat?.id;
  const messageId = post?.message_id;
  if (typeof chatId !== 'number' || typeof messageId !== 'number') return null;
  const chatType = String(post?.chat?.type || '');
  if (chatType !== 'channel' && chatType !== 'group' && chatType !== 'supergroup') return null;

  const key = makeChannelStampKey(chatId, messageId);
  const textPreview = String(post.caption || post.text || '').slice(0, 24);
  const hash = hashChannelPost(post);
  const postText = extractChannelPostText(post);
  const postTextHash = postText ? hashTextSnapshot(postText) : undefined;
  const channelTitle = String(post.chat?.title || (chatType === 'channel' ? 'channel' : 'chat'));
  const fileNamePrefix = chatType === 'channel' ? 'channel' : 'chat';
  const fileName = `${fileNamePrefix}_${Math.abs(chatId)}_${messageId}_${sanitizeAsciiSlug(textPreview, 20)}`;

  const prev = channelPostSessions.get(key);
  const sess: ChannelPostSession = {
    key,
    chatId,
    messageId,
    messageThreadId: typeof post.message_thread_id === 'number' ? post.message_thread_id : undefined,
    createdAt: Date.now(),
    hash,
    fileName,
    channelTitle,
    postText,
    postTextHash,
    promptMessageId: prev?.promptMessageId,
  };
  channelPostSessions.set(key, sess);
  return sess;
}

function getNotarizationCommentOptions(
  sess: PendingSession
): { postText: string; postTextHash?: string } | undefined {
  if (sess.kind !== 'channel_post' || sess.postTextMode !== 'hash_and_text' || !sess.postText) {
    return undefined;
  }
  return {
    postText: sess.postText,
    postTextHash: sess.postTextHash,
  };
}

function getChannelStampModePricing(mode: ChannelStampTextMode): { starsPrice: number; tonPrice: number; anchorTon: number } {
  if (mode === 'hash_and_text') {
    return {
      starsPrice: config.starsPostTextPrice,
      tonPrice: config.tonPostTextPrice,
      anchorTon: config.starsPostTextAnchorTon,
    };
  }

  return {
    starsPrice: config.starsPrice,
    tonPrice: config.tonPrice,
    anchorTon: config.starsAnchorTon,
  };
}

function getSessionPricing(sess: PendingSession): { starsPrice: number; tonPrice: number; anchorTon: number } {
  if (sess.kind === 'channel_post' && sess.postTextMode === 'hash_and_text') {
    return getChannelStampModePricing('hash_and_text');
  }
  return getChannelStampModePricing('hash_only');
}

function getChannelStampDoneTextKey(sess: PendingSession): string {
  return sess.kind === 'channel_post' && sess.postTextMode === 'hash_and_text'
    ? 'channel_stamp_done_with_text'
    : 'channel_stamp_done';
}

function getPostTextTonBytes(text?: string): number {
  return Buffer.byteLength(text || '', 'utf8');
}

function canStorePostTextInTon(text?: string): boolean {
  return Boolean(text) && getPostTextTonBytes(text) <= MAX_POST_TEXT_TON_BYTES;
}

function getChannelStampPrivateDoneMessage(userId: number, sess: PendingSession, txHash: string): string {
  const explorerUrl = getTonviewerUrl(txHash);
  return `${t(userId, getChannelStampDoneTextKey(sess))}\nTX: <a href="${explorerUrl}">${txHash}</a>`;
}

function padButtonLabel(label: string): string {
  return `${label}\u00A0\u00A0`;
}

function isStampableMessage(msg: any): boolean {
  if (!msg || typeof msg.message_id !== 'number') return false;
  if (typeof msg.text === 'string' && msg.text.trim()) {
    const text = msg.text.trim();
    if (/^\/[A-Za-z0-9_]+(?:@[A-Za-z0-9_]+)?$/.test(text)) return false;
    return true;
  }
  if (typeof msg.caption === 'string' && msg.caption.trim()) return true;
  if (Array.isArray(msg.photo) && msg.photo.length > 0) return true;
  if (msg.video || msg.animation || msg.document || msg.audio || msg.voice || msg.video_note || msg.sticker || msg.poll) return true;
  return false;
}

function isGroupLikeChatType(chatType: string): boolean {
  return chatType === 'channel' || chatType === 'group' || chatType === 'supergroup';
}

function messageContainsStampTrigger(msg: any): boolean {
  const tag = (config.groupStampTag || '').trim().toLowerCase();
  const text = String(msg?.text || '');
  const caption = String(msg?.caption || '');
  const textLower = text.toLowerCase();
  const captionLower = caption.toLowerCase();

  if (tag && (textLower.includes(tag) || captionLower.includes(tag))) return true;
  const stampCmdRe = /(^|\s)\/stamp(?:@[A-Za-z0-9_]+)?(?:\s|$)/i;
  return stampCmdRe.test(text) || stampCmdRe.test(caption);
}

function extractForwardSource(msg: any): { key: string; chatId: number; messageId: number } | null {
  if (!msg) return null;

  const origin = msg.forward_origin;
  let chatId: unknown;
  let messageId: unknown;
  let chatType = '';

  if (origin && (origin.type === 'channel' || origin.type === 'chat')) {
    chatId = origin.chat?.id;
    messageId = origin.message_id;
    chatType = String(origin.chat?.type || '');
  } else {
    chatId = msg.forward_from_chat?.id;
    messageId = msg.forward_from_message_id;
    chatType = String(msg.forward_from_chat?.type || '');
  }

  if (typeof chatId !== 'number' || typeof messageId !== 'number') return null;
  if (chatType && !isGroupLikeChatType(chatType)) return null;
  return { key: makeChannelStampKey(chatId, messageId), chatId, messageId };
}

function rememberForwardedStampTarget(userId: number, key: string): void {
  forwardedStampTargets.set(userId, { key, createdAt: Date.now() });
}

function takeFreshForwardedStampTarget(userId: number): string | null {
  const saved = forwardedStampTargets.get(userId);
  if (!saved) return null;
  if (Date.now() - saved.createdAt > FORWARDED_STAMP_TTL_MS) {
    forwardedStampTargets.delete(userId);
    return null;
  }
  return saved.key;
}

function resolveStampTargetSession(msg: any, userId: number): ChannelPostSession | null {
  const directCandidates = [msg?.reply_to_message, msg];
  for (const candidate of directCandidates) {
    const source = extractForwardSource(candidate);
    if (!source) continue;
    rememberForwardedStampTarget(userId, source.key);
    const sess = channelPostSessions.get(source.key);
    if (sess) return sess;
  }

  const remembered = takeFreshForwardedStampTarget(userId);
  if (!remembered) return null;
  return channelPostSessions.get(remembered) || null;
}

function isTonRateLimitError(error: unknown): boolean {
  const status = (error as any)?.response?.status;
  const result = String((error as any)?.response?.data?.result ?? '').toLowerCase();
  const message = String((error as any)?.message ?? '').toLowerCase();
  return status === 429 || result.includes('ratelimit') || message.includes('status code 429');
}

function describeTelegramLikeError(error: unknown): string {
  const e = error as any;
  const desc = e?.description || e?.response?.description || e?.message || 'unknown error';
  const code = e?.error_code || e?.response?.error_code;
  return code ? `code=${code} ${desc}` : String(desc);
}

function makeVerificationLink(token: string): string | undefined {
  const u = (config.botUsername || '').replace(/^@/, '').trim();
  if (!u) return undefined;
  return `https://t.me/${u}?start=v${token}`;
}

function normalizeOwnerInput(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isCaptchaVerified(userId: number): boolean {
  const until = captchaVerifiedUntil.get(userId) ?? 0;
  return until > Date.now();
}

function markCaptchaVerified(userId: number): void {
  const ttlMs = config.captchaTtlMinutes * 60_000;
  captchaVerifiedUntil.set(userId, Date.now() + ttlMs);
  captchaFailState.delete(userId);
}

function getCaptchaBlockLeftMs(userId: number): number {
  const state = captchaFailState.get(userId);
  if (!state) return 0;
  const left = state.blockedUntil - Date.now();
  return left > 0 ? left : 0;
}

function registerCaptchaFail(userId: number): { blockMs: number } {
  const now = Date.now();
  const prev = captchaFailState.get(userId);
  const attempts24h = (prev?.attempts24h || []).filter((ts) => now - ts <= CAPTCHA_FAIL_WINDOW_MS);
  attempts24h.push(now);

  const streak = (prev?.streak || 0) + 1;
  let blockMs = 0;
  if (attempts24h.length >= 5) {
    blockMs = CAPTCHA_BLOCK_60_MIN_MS;
  } else if (streak >= 3) {
    blockMs = CAPTCHA_BLOCK_30_MIN_MS;
  }

  const blockedUntil = Math.max(prev?.blockedUntil || 0, blockMs > 0 ? now + blockMs : 0);
  captchaFailState.set(userId, { streak, attempts24h, blockedUntil });
  return { blockMs };
}

async function replyCaptchaBlocked(ctx: Context, userId: number, isCallback: boolean): Promise<void> {
  const leftMs = getCaptchaBlockLeftMs(userId);
  if (leftMs <= 0) return;
  const leftMin = Math.max(1, Math.ceil(leftMs / 60_000));
  const text = t(userId, 'captcha_blocked', { minutes: leftMin });
  if (isCallback) {
    await ctx.answerCallbackQuery({ text, show_alert: true }).catch(() => {});
    return;
  }
  await ctx.reply(text).catch(() => {});
}

async function showCaptcha(ctx: Context, userId: number): Promise<void> {
  const target = CAPTCHA_OPTIONS[Math.floor(Math.random() * CAPTCHA_OPTIONS.length)];
  captchaChallenges.set(userId, { target: target.id, expiresAt: Date.now() + CAPTCHA_CHALLENGE_TTL_MS });

  const keyboard = new InlineKeyboard();
  const shuffled = shuffle(CAPTCHA_OPTIONS);
  for (let i = 0; i < shuffled.length; i++) {
    const option = shuffled[i];
    keyboard.text(option.emoji, `captcha_${option.id}`);
    if ((i + 1) % 3 === 0 || i === shuffled.length - 1) {
      keyboard.row();
    }
  }

  await ctx.reply(`${t(userId, 'captcha_title')}\n\n${t(userId, 'captcha_prompt', { color: target.emoji })}`, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

async function ensureCaptchaForMessage(ctx: Context, userId: number): Promise<boolean> {
  if (getCaptchaBlockLeftMs(userId) > 0) {
    await replyCaptchaBlocked(ctx, userId, false);
    return false;
  }
  if (isCaptchaVerified(userId)) return true;
  await showCaptcha(ctx, userId);
  return false;
}

async function ensureCaptchaForCallback(ctx: Context, userId: number): Promise<boolean> {
  if (getCaptchaBlockLeftMs(userId) > 0) {
    await replyCaptchaBlocked(ctx, userId, true);
    return false;
  }
  if (isCaptchaVerified(userId)) return true;
  await ctx.answerCallbackQuery().catch(() => {});
  await showCaptcha(ctx, userId);
  return false;
}

async function promptOwnerInput(ctx: Context, userId: number): Promise<void> {
  const kb = new InlineKeyboard()
    .text(t(userId, 'skip'), 'skip_owner')
    .text(t(userId, 'btn_cancel'), 'cancel_session');
  await ctx.reply(`${t(userId, 'enter_owner_optional')}\n${t(userId, 'or_skip')}`, {
    parse_mode: 'HTML',
    reply_markup: kb,
  });
}

async function sendChannelStampModeOptions(
  api: Context['api'],
  chatId: number,
  userId: number,
  postText?: string
): Promise<void> {
  const hashOnlyPricing = getChannelStampModePricing('hash_only');
  const hashTextPricing = getChannelStampModePricing('hash_and_text');
  const canStoreText = canStorePostTextInTon(postText);
  const kb = new InlineKeyboard().text(t(userId, 'channel_stamp_mode_hash_only'), 'stamp_mode_hash_only').row();
  if (canStoreText) {
    kb.text(t(userId, 'channel_stamp_mode_hash_text'), 'stamp_mode_hash_text').row();
  }
  kb.text(t(userId, 'btn_cancel'), 'cancel_session');

  const messageParts = [
    t(userId, 'channel_stamp_mode_title'),
    t(userId, 'channel_stamp_mode_hash_only_hint', hashOnlyPricing),
  ];

  if (canStoreText) {
    messageParts.push(
      t(userId, 'channel_stamp_mode_hash_text_hint', hashTextPricing),
      t(userId, 'channel_stamp_mode_text_warning')
    );
  } else if (postText) {
    messageParts.push(t(userId, 'channel_stamp_mode_text_too_long', { maxBytes: MAX_POST_TEXT_TON_BYTES }));
  }

  await api.sendMessage(
    chatId,
    messageParts.join('\n\n'),
    {
      parse_mode: 'HTML',
      reply_markup: kb,
    }
  );
}

async function sendPaymentOptions(api: Context['api'], chatId: number, userId: number, sess: PendingSession): Promise<void> {
  if (sess.state !== 'await_payment') {
    sess.state = 'await_payment';
  }

  const { starsPrice, tonPrice } = getSessionPricing(sess);

  const tonLink = createTonConnectLink(sess.hash, getNotarizationCommentOptions(sess), tonPrice);

  const kb = new InlineKeyboard();
  if (!sess.starsPaid) {
    kb.text(padButtonLabel(t(userId, 'btn_pay_stars', { starsPrice })), 'pay_stars').row();
    kb.url(padButtonLabel(t(userId, 'btn_pay_ton', { tonPrice })), tonLink).row();
  }
  kb.text(padButtonLabel(t(userId, 'btn_verify_payment')), 'verify_ton')
    .row()
    .text(padButtonLabel(t(userId, 'btn_cancel')), 'cancel_session');

  await api.sendMessage(chatId, INVISIBLE_MESSAGE, { reply_markup: kb });
}

async function sendSessionOptions(api: Context['api'], chatId: number, userId: number, sess: PendingSession): Promise<void> {
  if (sess.kind === 'channel_post' && sess.postText && !sess.postTextMode) {
    await sendChannelStampModeOptions(api, chatId, userId, sess.postText);
    return;
  }
  await sendPaymentOptions(api, chatId, userId, sess);
}

async function showPaymentOptions(ctx: Context, userId: number, sess: PendingSession): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;
  await sendSessionOptions(ctx.api, chatId, userId, sess);
}

async function hashTelegramFile(filePath: string): Promise<string> {
  const fileUrl = `https://api.telegram.org/file/bot${config.botToken}/${filePath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.fileFetchTimeoutSec * 1000);

  try {
    const response = await fetch(fileUrl, { signal: controller.signal });
    if (!response.ok || !response.body) {
      throw new Error(`Bad Telegram file response: ${response.status}`);
    }

    const hasher = createHash('sha256');
    const stream = Readable.fromWeb(response.body as any);

    let totalBytes = 0;
    for await (const chunk of stream) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
      totalBytes += buf.length;
      if (totalBytes > config.maxDocumentBytes) {
        throw new Error('FILE_TOO_LARGE');
      }
      hasher.update(buf);
    }

    return hasher.digest('hex');
  } finally {
    clearTimeout(timeout);
  }
}

async function publishChannelStampProof(
  ctx: Context,
  userId: number,
  sess: PendingSession,
  txHash: string,
  txTimestamp: Date,
  pdfBuffer?: Buffer
): Promise<boolean> {
  if (sess.kind !== 'channel_post' || !sess.channelKey || !sess.channelChatId || !sess.channelMessageId) {
    return false;
  }

  if (channelStamps[sess.channelKey]) {
    return false;
  }

  const chatId = sess.channelChatId;
  const messageId = sess.channelMessageId;
  const messageThreadId = sess.channelThreadId;
  const explorerUrl = getTonviewerUrl(txHash);
  const token = hashToToken(sess.hash);
  const vlink = makeVerificationLink(token);

  const proofMsg = await ctx.api.sendMessage(chatId, t(userId, 'hash_recorded', { txHash, explorerUrl }), {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_to_message_id: messageId,
    message_thread_id: messageThreadId,
  });

  const pdf =
    pdfBuffer ??
    (await generateCertificate({
      fileName: sess.fileName,
      documentHash: sess.hash,
      txHash,
      timestamp: txTimestamp,
      ownerName: sess.ownerName,
      verificationLink: vlink,
      lang: getLang(userId),
    }));

  await ctx.api.sendDocument(chatId, new InputFile(Buffer.from(pdf), `ProofStamp_${sess.fileName}.pdf`), {
    reply_to_message_id: messageId,
    message_thread_id: messageThreadId,
  });

  if (config.channelStampPinProof && proofMsg.message_id) {
    await ctx.api.pinChatMessage(chatId, proofMsg.message_id, { disable_notification: true }).catch(() => {});
  }

  channelStamps[sess.channelKey] = {
    chatId,
    messageId,
    messageThreadId,
    hash: sess.hash,
    txHash,
    timestamp: Math.floor(txTimestamp.getTime() / 1000),
    stampedAt: Date.now(),
    proofMessageId: proofMsg.message_id,
    fileName: sess.fileName,
    channelTitle: sess.ownerName || 'channel',
    textIncluded: sess.postTextMode === 'hash_and_text' && Boolean(sess.postText),
    textHash: sess.postTextMode === 'hash_and_text' ? sess.postTextHash : undefined,
  };
  saveChannelStampStore();
  channelPostSessions.delete(sess.channelKey);
  return true;
}

async function startChannelStampInPrivate(
  api: Context['api'],
  userId: number,
  sess: ChannelPostSession
): Promise<ChannelStampInitResult> {
  if (channelStamps[sess.key]) {
    await api.sendMessage(userId, t(userId, 'channel_stamp_already_done')).catch(() => {});
    return 'already_done';
  }

  clearPendingSession(userId);
  const paySess: PendingSession = {
    sessionId: newSessionId(),
    hash: sess.hash,
    fileName: sess.fileName,
    createdAt: Date.now(),
    ownerName: sess.channelTitle,
    state: 'await_payment',
    kind: 'channel_post',
    channelKey: sess.key,
    channelChatId: sess.chatId,
    channelMessageId: sess.messageId,
    channelThreadId: sess.messageThreadId,
    postTextMode: sess.postText ? undefined : 'hash_only',
    postText: sess.postText,
    postTextHash: sess.postTextHash,
  };
  setSession(userId, paySess);

  const intro = t(userId, 'channel_stamp_payment_intro', {
    channelTitle: escapeHtml(sess.channelTitle),
    postId: sess.messageId,
    starsPrice: config.starsPrice,
    tonPrice: config.tonPrice,
  });

  try {
    if (sess.postText) {
      await sendChannelStampModeOptions(api, userId, userId, sess.postText);
    } else {
      await api.sendMessage(userId, intro, { parse_mode: 'HTML' });
      await sendSessionOptions(api, userId, userId, paySess);
    }
    return 'started';
  } catch (err) {
    clearPendingSession(userId);
    console.warn(`[CHANNEL_STAMP] failed to open private flow for user ${userId} (${sess.key}): ${describeTelegramLikeError(err)}`);
    return 'dm_unavailable';
  }
}

async function sendChannelStampPrompt(api: Context['api'], sess: ChannelPostSession): Promise<boolean> {
  if (channelStamps[sess.key]) return true;
  if (sess.promptMessageId) return true;

  const kb = new InlineKeyboard().text(t(0, 'channel_stamp_btn'), `stamp_post:${sess.chatId}:${sess.messageId}`);
  let prompt = await api.sendMessage(sess.chatId, t(0, 'channel_stamp_ready'), {
    reply_to_message_id: sess.messageId,
    message_thread_id: sess.messageThreadId,
    reply_markup: kb,
  }).catch(async (err) => {
    console.warn(`[CHANNEL_STAMP] reply prompt send failed for ${sess.key}: ${describeTelegramLikeError(err)}`);
    return null;
  });

  if (!prompt) {
    prompt = await api.sendMessage(sess.chatId, t(0, 'channel_stamp_ready'), {
      message_thread_id: sess.messageThreadId,
      reply_markup: kb,
    }).catch(async (err) => {
      console.warn(`[CHANNEL_STAMP] plain prompt send failed for ${sess.key}: ${describeTelegramLikeError(err)}`);
      return null;
    });
  }

  if (!prompt?.message_id) return false;

  sess.promptMessageId = prompt.message_id;
  channelPostSessions.set(sess.key, sess);
  return true;
}

async function processStartPayload(ctx: Context, userId: number, payload: string): Promise<boolean> {
  if (!payload.startsWith('v') || payload.length <= 1) return false;

  const token = payload.slice(1);
  try {
    const hash = tokenToHash(token);
    await ctx.reply(t(userId, 'computing_hash'));
    const res = await verifyDocumentHash(hash);

    if (res.found && res.txHash && res.timestamp) {
      const explorerUrl = getTonviewerUrl(res.txHash);
      await ctx.reply(t(userId, 'hash_recorded', { txHash: res.txHash, explorerUrl }), {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });

      await ctx.reply(t(userId, 'doc_info', { fileName: '-', hash }), { parse_mode: 'HTML' });
    } else {
      await ctx.reply(t(userId, 'not_found'));
    }
  } catch {
    await ctx.reply(t(userId, 'error_processing'));
  }

  return true;
}

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  setInterval(cleanupState, 60_000).unref?.();

  bot.command('start', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    if (!chatId || !userId) return;
    if (ctx.chat?.type !== 'private') return;
    if (hitRateLimit('start', userId, 12, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }

    if (getLang(userId) === 'en' && ctx.from?.language_code) {
      const guessed = normalizeLang(ctx.from.language_code);
      setLang(userId, guessed);
    }

    const payload = (ctx.match || '').trim();
    if (getCaptchaBlockLeftMs(userId) > 0) {
      await replyCaptchaBlocked(ctx, userId, false);
      return;
    }
    // Always challenge on /start to keep explicit anti-spam entry point.
    captchaVerifiedUntil.delete(userId);
    captchaChallenges.delete(userId);
    if (payload) deferredStartPayload.set(userId, { payload, createdAt: Date.now() });
    await showCaptcha(ctx, userId);
  });

  bot.command('lang', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (ctx.chat?.type !== 'private') return;
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;
    await showLanguageSelection(ctx, userId);
  });

  bot.callbackQuery(CAPTCHA_CALLBACK_RE, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('captcha', userId, 60, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }

    if (getCaptchaBlockLeftMs(userId) > 0) {
      await replyCaptchaBlocked(ctx, userId, true);
      return;
    }

    const challenge = captchaChallenges.get(userId);
    const match = ctx.match as RegExpMatchArray;
    const picked = match[1] as CaptchaEmojiId;

    if (!challenge || challenge.expiresAt <= Date.now()) {
      const fail = registerCaptchaFail(userId);
      if (fail.blockMs > 0) {
        await replyCaptchaBlocked(ctx, userId, true);
        return;
      }
      await ctx.answerCallbackQuery({ text: t(userId, 'captcha_try_again') }).catch(() => {});
      await showCaptcha(ctx, userId);
      return;
    }

    if (picked !== challenge.target) {
      const fail = registerCaptchaFail(userId);
      if (fail.blockMs > 0) {
        await replyCaptchaBlocked(ctx, userId, true);
        return;
      }
      await ctx.answerCallbackQuery({ text: t(userId, 'captcha_try_again') }).catch(() => {});
      await showCaptcha(ctx, userId);
      return;
    }

    captchaChallenges.delete(userId);
    markCaptchaVerified(userId);

    await ctx.answerCallbackQuery({ text: t(userId, 'captcha_success') }).catch(() => {});

    const deferredPayload = deferredStartPayload.get(userId)?.payload || '';
    deferredStartPayload.delete(userId);

    if (deferredPayload) {
      const handled = await processStartPayload(ctx, userId, deferredPayload);
      if (handled) return;
    }

    await showLanguageSelection(ctx, userId);
    await ctx.reply(t(userId, 'welcome'), { parse_mode: 'HTML' });
  });

  for (const lang of ['ru', 'en', 'zh', 'es', 'pt', 'de', 'fr', 'tr', 'ar', 'id', 'hi'] as Lang[]) {
    bot.callbackQuery(`set_lang_${lang}`, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      if (ctx.chat?.type !== 'private') {
        await ctx.answerCallbackQuery().catch(() => {});
        return;
      }
      if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
        await replyRateLimited(ctx, userId, true);
        return;
      }
      setLang(userId, lang);
      await ctx.answerCallbackQuery({ text: t(userId, 'lang_changed') }).catch(() => {});
      await ctx.reply(t(userId, 'welcome'), { parse_mode: 'HTML' });
    });
  }

  bot.command('help', async (ctx) => {
    const userId = ctx.from?.id ?? 0;
    if (ctx.chat?.type !== 'private') return;
    if (hitRateLimit('msg', userId, 30, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;

    const helpText =
      `${t(userId, 'help', { starsPrice: config.starsPrice, tonPrice: config.tonPrice })}\n\n` +
      t(userId, 'help_post_text_feature', { starsPrice: config.starsPostTextPrice, tonPrice: config.tonPostTextPrice });
    await ctx.reply(helpText, {
      parse_mode: 'HTML',
    });
  });

  bot.command('verify', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') return;
    if (hitRateLimit('msg', userId, 30, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;

    verifyModeChats.add(chatId);
    await ctx.reply(t(userId, 'verify_mode'), { parse_mode: 'HTML' });
  });

  bot.command('cancel', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') return;
    if (hitRateLimit('msg', userId, 30, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;

    clearChatState(chatId);
    await ctx.reply(t(userId, 'session_cleared'));
  });

  bot.command('stamp', async (ctx) => {
    const userId = ctx.from?.id ?? 0;
    const chatType = String(ctx.chat?.type || '');
    if (!chatType || !userId) return;

    if (!config.channelStampEnabled) {
      if (chatType === 'private') {
        await ctx.reply(t(userId, 'channel_stamp_disabled'));
      }
      return;
    }

    if (hitRateLimit('channel_stamp', userId, 20, RATE_LIMIT_WINDOW_MS)) {
      if (chatType === 'private') {
        await replyRateLimited(ctx, userId, false);
      }
      return;
    }

    if (chatType === 'private') {
      if (!(await ensureCaptchaForMessage(ctx, userId))) return;

      const msg = (ctx as any).message as any;
      const sess = resolveStampTargetSession(msg, userId);
      if (!sess) {
        await ctx.reply(t(userId, 'channel_stamp_private_usage', { tag: config.groupStampTag }));
        return;
      }

      const result = await startChannelStampInPrivate(ctx.api, userId, sess);
      if (result === 'dm_unavailable') {
        await ctx.reply(t(userId, 'error_processing'));
      }
      return;
    }

    if (chatType !== 'group' && chatType !== 'supergroup') return;

    const msg = (ctx as any).message as any;
    const target = msg?.reply_to_message as any;
    if (!target || !isStampableMessage(target)) {
      await ctx.api.sendMessage(userId, t(userId, 'channel_stamp_private_usage', { tag: config.groupStampTag })).catch(() => {});
      return;
    }

    const sess = upsertChannelPostSession(target);
    if (!sess) return;
    await startChannelStampInPrivate(ctx.api, userId, sess);
  });

  bot.on('channel_post', async (ctx) => {
    if (!config.channelStampEnabled) return;

    const post = (ctx as any).channelPost as any;
    const chatType = String(post?.chat?.type || '');
    if (chatType !== 'channel') return;
    if (!isStampableMessage(post)) return;
    const sess = upsertChannelPostSession(post);
    if (!sess) return;
    await sendChannelStampPrompt(ctx.api, sess);
  });

  bot.on('edited_channel_post', async (ctx) => {
    if (!config.channelStampEnabled) return;

    const post = (ctx as any).editedChannelPost as any;
    const chatType = String(post?.chat?.type || '');
    if (chatType !== 'channel') return;
    if (!isStampableMessage(post)) return;
    const sess = upsertChannelPostSession(post);
    if (!sess) return;
    if (channelStamps[sess.key]) return;
    await sendChannelStampPrompt(ctx.api, sess);
  });

  bot.on('message', async (ctx, next) => {
    if (!config.channelStampEnabled) return next();

    const msg = (ctx as any).message as any;
    const chatType = String(msg?.chat?.type || '');
    if (chatType === 'private') {
      const userId = ctx.from?.id;
      if (typeof userId === 'number') {
        const source = extractForwardSource(msg);
        if (source) rememberForwardedStampTarget(userId, source.key);
      }
      return next();
    }

    if (chatType !== 'group' && chatType !== 'supergroup') return next();
    if (!isStampableMessage(msg)) return next();

    const sess = upsertChannelPostSession(msg);
    if (!sess) return next();
    if (!messageContainsStampTrigger(msg)) return;

    const triggerUserId = msg?.from?.id;
    if (typeof triggerUserId !== 'number') return;
    await startChannelStampInPrivate(ctx.api, triggerUserId, sess);
  });

  bot.on('edited_message', async (ctx) => {
    if (!config.channelStampEnabled) return;

    const msg = (ctx as any).editedMessage as any;
    const chatType = String(msg?.chat?.type || '');
    if (chatType !== 'group' && chatType !== 'supergroup') return;
    if (!isStampableMessage(msg)) return;

    const sess = upsertChannelPostSession(msg);
    if (!sess) return;
    if (!messageContainsStampTrigger(msg)) return;

    const triggerUserId = msg?.from?.id;
    if (typeof triggerUserId !== 'number') return;
    await startChannelStampInPrivate(ctx.api, triggerUserId, sess);
  });

  bot.callbackQuery(/stamp_post:(-?\d+):(\d+)/, async (ctx) => {
    const userId = ctx.from?.id ?? 0;
    if (hitRateLimit('channel_stamp', userId, 20, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }

    if (!config.channelStampEnabled) {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_disabled') }).catch(() => {});
      return;
    }

    const match = ctx.match as RegExpMatchArray;
    const chatId = Number(match[1]);
    const messageId = Number(match[2]);
    if (!Number.isFinite(chatId) || !Number.isFinite(messageId)) {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_not_found') }).catch(() => {});
      return;
    }

    const key = makeChannelStampKey(chatId, messageId);
    const sess = channelPostSessions.get(key);
    if (!sess) {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_not_found') }).catch(() => {});
      return;
    }

    const result = await startChannelStampInPrivate(ctx.api, userId, sess);
    if (result === 'started') {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_open_dm') }).catch(() => {});
    } else if (result === 'already_done') {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_already_done') }).catch(() => {});
    } else {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_open_private_alert') }).catch(() => {});
    }
  });

  bot.callbackQuery('channel_stamp_noop', async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
  });

  bot.callbackQuery('stamp_mode_hash_only', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess || sess.kind !== 'channel_post') {
      await ctx.answerCallbackQuery({ text: t(userId, 'session_expired') }).catch(() => {});
      return;
    }

    sess.postTextMode = 'hash_only';
    setSession(chatId, sess);

    await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_mode_hash_only_selected') }).catch(() => {});
    await sendPaymentOptions(ctx.api, chatId, userId, sess);
  });

  bot.callbackQuery('stamp_mode_hash_text', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess || sess.kind !== 'channel_post' || !sess.postText) {
      await ctx.answerCallbackQuery({ text: t(userId, 'session_expired') }).catch(() => {});
      return;
    }
    if (!canStorePostTextInTon(sess.postText)) {
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_mode_text_too_long_short') }).catch(() => {});
      return;
    }

    sess.postTextMode = 'hash_and_text';
    setSession(chatId, sess);

    await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_mode_hash_text_selected') }).catch(() => {});
    await sendPaymentOptions(ctx.api, chatId, userId, sess);
  });

  bot.on('message:text', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') return;
    const text = ctx.message.text || '';
    if (!awaitingOwner.has(chatId)) {
      if (!text.startsWith('/')) {
        if (hitRateLimit('hint', userId, 12, RATE_LIMIT_WINDOW_MS)) return;
        if (!(await ensureCaptchaForMessage(ctx, userId))) return;
        await ctx.reply(t(userId, 'send_file_hint'));
      }
      return;
    }

    if (hitRateLimit('text', userId, 50, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess) {
      awaitingOwner.delete(chatId);
      await ctx.reply(t(userId, 'session_expired'));
      return;
    }

    const ownerName = normalizeOwnerInput(ctx.message.text || '');
    if (!ownerName || ownerName.startsWith('/')) {
      if (!ownerName.startsWith('/')) {
        await ctx.reply(t(userId, 'owner_hint'));
      }
      return;
    }

    sess.ownerName = ownerName.slice(0, 120);
    sess.state = 'await_payment';
    setSession(chatId, sess);
    awaitingOwner.delete(chatId);

    await ctx.reply(t(userId, 'owner_saved'));
    await showPaymentOptions(ctx, userId, sess);
  });

  bot.on('message:document', async (ctx) => {
    if (ctx.chat?.type !== 'private') return;
    const chatId = ctx.chat.id;
    const userId = ctx.from?.id ?? chatId;
    if (hitRateLimit('doc', userId, 6, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) {
      await ctx.reply(t(userId, 'captcha_then_resend_file'));
      return;
    }

    if (hashJobsInProgress.has(chatId)) {
      await ctx.reply(t(userId, 'processing_in_progress'));
      return;
    }

    const doc = ctx.message.document;
    if ((doc.file_size ?? 0) > config.maxDocumentBytes) {
      await ctx.reply(t(userId, 'file_too_large', { maxMb: config.maxDocumentMb }));
      return;
    }

    hashJobsInProgress.add(chatId);
    const progressMsg = await ctx.reply(t(userId, 'computing_hash'));

    try {
      const file = await ctx.api.getFile(doc.file_id);
      if (!file.file_path) throw new Error('FILE_PATH_MISSING');
      const hash = await hashTelegramFile(file.file_path);

      await ctx.api.editMessageText(
        chatId,
        progressMsg.message_id,
        t(userId, 'doc_info', { fileName: escapeHtml(doc.file_name || 'document'), hash }),
        { parse_mode: 'HTML' }
      ).catch(async () => {
        await ctx.reply(t(userId, 'doc_info', { fileName: escapeHtml(doc.file_name || 'document'), hash }), {
          parse_mode: 'HTML',
        });
      });

      if (verifyModeChats.has(chatId)) {
        verifyModeChats.delete(chatId);
        await ctx.reply(t(userId, 'verifying'));

        const res = await verifyDocumentHash(hash);
        if (res.found && res.txHash && res.timestamp) {
          const explorerUrl = getTonviewerUrl(res.txHash);
          await ctx.reply(t(userId, 'hash_recorded', { txHash: res.txHash, explorerUrl }), {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          });
        } else {
          await ctx.reply(t(userId, 'not_found'));
        }
        return;
      }

      clearPendingSession(chatId);
      setSession(chatId, {
        sessionId: newSessionId(),
        hash,
        fileName: doc.file_name || 'document',
        createdAt: Date.now(),
        state: 'await_owner',
        kind: 'document',
      });
      awaitingOwner.add(chatId);

      await promptOwnerInput(ctx, userId);
    } catch (error) {
      console.error('Error processing document:', error);
      const message = String((error as Error)?.message || '');
      const isAbort = (error as any)?.name === 'AbortError';
      if (message.includes('FILE_TOO_LARGE')) {
        await ctx.reply(t(userId, 'file_too_large', { maxMb: config.maxDocumentMb }));
      } else if (isAbort) {
        await ctx.reply(t(userId, 'download_timeout'));
      } else {
        await ctx.reply(t(userId, 'error_processing'));
      }
    } finally {
      hashJobsInProgress.delete(chatId);
    }
  });

  bot.on('message:photo', async (ctx) => {
    if (ctx.chat?.type !== 'private') return;
    const userId = ctx.from?.id ?? 0;
    if (hitRateLimit('msg', userId, 30, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, false);
      return;
    }
    if (!(await ensureCaptchaForMessage(ctx, userId))) return;

    await ctx.reply(t(userId, 'send_as_file'), { parse_mode: 'HTML' });
  });

  bot.callbackQuery('skip_owner', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess) {
      await ctx.answerCallbackQuery({ text: t(userId, 'session_expired') }).catch(() => {});
      return;
    }

    awaitingOwner.delete(chatId);
    sess.state = 'await_payment';
    setSession(chatId, sess);

    await ctx.answerCallbackQuery({ text: t(userId, 'owner_skipped') }).catch(() => {});
    await showPaymentOptions(ctx, userId, sess);
  });

  bot.callbackQuery('cancel_session', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    clearChatState(chatId);
    await ctx.answerCallbackQuery({ text: t(userId, 'session_cleared') }).catch(() => {});
    await ctx.reply(t(userId, 'session_cleared'));
  });

  bot.callbackQuery('pay_stars', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess) {
      await ctx.answerCallbackQuery({ text: t(userId, 'session_expired') }).catch(() => {});
      return;
    }

    if (sess.state === 'processing') {
      await ctx.answerCallbackQuery({ text: t(userId, 'processing_in_progress') }).catch(() => {});
      return;
    }

    if (sess.starsInvoicePayload && !sess.starsPaid) {
      await ctx.answerCallbackQuery({ text: t(userId, 'invoice_already_created') }).catch(() => {});
      await ctx.reply(t(userId, 'invoice_already_created_help'));
      return;
    }

    if (sess.starsPaid) {
      await ctx.answerCallbackQuery({ text: t(userId, 'stars_already_paid') }).catch(() => {});
      await ctx.reply(t(userId, 'stars_already_paid_help'));
      await showPaymentOptions(ctx, userId, sess);
      return;
    }

    if (sess.kind === 'channel_post' && sess.channelKey && channelStamps[sess.channelKey]) {
      clearPendingSession(chatId);
      await ctx.answerCallbackQuery({ text: t(userId, 'channel_stamp_already_done') }).catch(() => {});
      await ctx.reply(t(userId, 'channel_stamp_already_done'));
      return;
    }

    awaitingOwner.delete(chatId);
    await ctx.answerCallbackQuery().catch(() => {});

    const token = hashToToken(sess.hash);
    const { starsPrice } = getSessionPricing(sess);
    const invoice = createStarsInvoice(chatId, token, sess.sessionId, starsPrice);

    const prevPayload = sess.starsInvoicePayload;
    sess.starsInvoicePayload = invoice.payload;
    sess.state = 'await_payment';
    setSession(chatId, sess);

    try {
      await ctx.api.sendInvoice(chatId, invoice.title, invoice.description, invoice.payload, invoice.currency, invoice.prices, {
        provider_token: '',
      });
    } catch (e) {
      if (prevPayload) {
        sess.starsInvoicePayload = prevPayload;
      } else {
        delete sess.starsInvoicePayload;
      }
      setSession(chatId, sess);
      console.error('Error sending stars invoice:', e);
      await ctx.reply(t(userId, 'error_processing'));
    }
  });

  bot.callbackQuery('verify_ton', async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id ?? 0;
    if (!chatId) return;
    if (ctx.chat?.type !== 'private') {
      await ctx.answerCallbackQuery().catch(() => {});
      return;
    }
    if (hitRateLimit('cb', userId, 40, RATE_LIMIT_WINDOW_MS)) {
      await replyRateLimited(ctx, userId, true);
      return;
    }
    if (!(await ensureCaptchaForCallback(ctx, userId))) return;

    const sess = pending.get(chatId);
    if (!sess) {
      await ctx.answerCallbackQuery({ text: t(userId, 'session_expired') }).catch(() => {});
      return;
    }

    if (sess.state === 'processing') {
      await ctx.answerCallbackQuery({ text: t(userId, 'processing_in_progress') }).catch(() => {});
      return;
    }

    awaitingOwner.delete(chatId);
    sess.state = 'processing';
    setSession(chatId, sess);

    await ctx.answerCallbackQuery().catch(() => {});
    await ctx.reply(t(userId, 'verifying'));

    const channelKey = sess.kind === 'channel_post' ? sess.channelKey : undefined;
    let channelLockAcquired = false;

    try {
      if (channelKey) {
        if (channelStamps[channelKey]) {
          clearPendingSession(chatId);
          await ctx.reply(t(userId, 'channel_stamp_already_done'));
          return;
        }
        if (processingChannelStamps.has(channelKey)) {
          sess.state = 'await_payment';
          setSession(chatId, sess);
          await ctx.reply(t(userId, 'processing_in_progress'));
          return;
        }
        processingChannelStamps.add(channelKey);
        channelLockAcquired = true;
      }

      const res: { found: boolean; txHash?: string; timestamp?: number; underpaid?: boolean } = sess.starsPaid
        ? await verifyDocumentHash(sess.hash)
        : await verifyTonPayment(sess.hash, getSessionPricing(sess).tonPrice);
      let txHash: string;
      let txTimestamp: Date;

      if (res.found && res.txHash && res.timestamp) {
        txHash = res.txHash;
        txTimestamp = new Date(res.timestamp * 1000);
      } else if (sess.starsPaid) {
        txHash = await sendNotarizationTx(sess.hash, getNotarizationCommentOptions(sess), getSessionPricing(sess).anchorTon);
        txTimestamp = new Date();
      } else {
        sess.state = 'await_payment';
        setSession(chatId, sess);
        if (!sess.starsPaid && res.underpaid) {
          await ctx.reply(t(userId, 'ton_payment_underpaid', { tonPrice: getSessionPricing(sess).tonPrice }));
        } else {
          await ctx.reply(t(userId, 'not_found'));
        }
        return;
      }

      const token = hashToToken(sess.hash);
      const vlink = makeVerificationLink(token);

      if (sess.kind === 'channel_post') {
        const pdf = await generateCertificate({
          fileName: sess.fileName,
          documentHash: sess.hash,
          txHash,
          timestamp: txTimestamp,
          ownerName: sess.ownerName,
          verificationLink: vlink,
          lang: getLang(userId),
        });

        const published = await publishChannelStampProof(ctx, userId, sess, txHash, txTimestamp, pdf);
        if (published) {
          await ctx.reply(getChannelStampPrivateDoneMessage(userId, sess, txHash), {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          });
        } else {
          await ctx.reply(t(userId, 'channel_stamp_already_done'));
        }
      } else {
        await ctx.api.sendChatAction(chatId, 'upload_document').catch(() => {});
        const pdf = await generateCertificate({
          fileName: sess.fileName,
          documentHash: sess.hash,
          txHash,
          timestamp: txTimestamp,
          ownerName: sess.ownerName,
          verificationLink: vlink,
          lang: getLang(userId),
        });

        await ctx.replyWithDocument(new InputFile(pdf, `ProofStamp_${sess.fileName}.pdf`));
      }

      if (sess.starsPaid && (sess.starsChargeId || sess.starsInvoicePayload)) {
        markPaymentProcessed(sess.starsChargeId || '', sess.starsInvoicePayload || '');
      }
      if (config.sweepAfterPayment) {
        maybeSweepToTreasury('ton_payment').catch(() => {});
      }
      clearPendingSession(chatId);
    } catch (e) {
      console.error('Error verifying TON payment:', e);
      const current = pending.get(chatId);
      if (current && current.sessionId === sess.sessionId) {
        current.state = 'await_payment';
        if (sess.starsPaid) current.starsPaid = true;
        setSession(chatId, current);
      }
      if (isTonRateLimitError(e)) {
        await ctx.reply(t(userId, 'ton_rate_limited_retry'));
        const fresh = pending.get(chatId);
        if (fresh) await showPaymentOptions(ctx, userId, fresh);
      } else {
        await ctx.reply(t(userId, 'error_processing'));
      }
    } finally {
      if (channelKey && channelLockAcquired) {
        processingChannelStamps.delete(channelKey);
      }
    }
  });

  bot.on('pre_checkout_query', async (ctx) => {
    const userId = ctx.from?.id ?? 0;
    const q = ctx.preCheckoutQuery;
    const parsed = parseStarsPayload(q.invoice_payload || '');
    const payload = q.invoice_payload || '';

    if (!parsed || q.currency !== 'XTR') {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'invalid_payment')).catch(() => {});
      return;
    }

    if (hasProcessedPayload(payload)) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'payment_already_processed')).catch(() => {});
      return;
    }

    let expectedHash: string;
    try {
      expectedHash = tokenToHash(parsed!.hashToken);
    } catch {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'invalid_payment')).catch(() => {});
      return;
    }

    const bound = findSessionByPayload(payload);
    if (!bound) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'session_expired')).catch(() => {});
      return;
    }

    const { sess } = bound;
    const { starsPrice } = getSessionPricing(sess);
    if (q.total_amount !== starsPrice) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'invalid_payment')).catch(() => {});
      return;
    }

    const pendingTtlMs = config.pendingTtlMinutes * 60_000;
    if (Date.now() - sess.createdAt > pendingTtlMs) {
      clearPendingSession(bound.chatId);
      await ctx.answerPreCheckoutQuery(false, t(userId, 'session_expired')).catch(() => {});
      return;
    }

    if (sess.hash !== expectedHash) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'invalid_payment')).catch(() => {});
      return;
    }

    if (parsed!.sessionId && sess.sessionId !== parsed!.sessionId) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'invalid_payment')).catch(() => {});
      return;
    }

    if (sess.state === 'processing' || sess.starsPaid) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'payment_already_processed')).catch(() => {});
      return;
    }

    if (sess.kind === 'channel_post' && sess.channelKey && channelStamps[sess.channelKey]) {
      await ctx.answerPreCheckoutQuery(false, t(userId, 'channel_stamp_already_done')).catch(() => {});
      return;
    }

    await ctx.answerPreCheckoutQuery(true).catch(() => {});
  });

  bot.on('message:successful_payment', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from?.id ?? 0;
    const payment = ctx.message.successful_payment;
    const payload = payment.invoice_payload || '';
    const parsed = parseStarsPayload(payload);
    const chargeId = (payment.telegram_payment_charge_id || '').trim();

    if (!parsed || payment.currency !== 'XTR') {
      await ctx.reply(t(userId, 'invalid_payment'));
      return;
    }

    if (!chargeId) {
      await ctx.reply(t(userId, 'invalid_payment'));
      return;
    }

    if (hasProcessedCharge(chargeId) || hasProcessedPayload(payload)) {
      await ctx.reply(t(userId, 'payment_already_processed'));
      return;
    }

    if (processingPayments.has(chargeId)) {
      await ctx.reply(t(userId, 'processing_in_progress'));
      return;
    }

    let hash: string;
    try {
      hash = tokenToHash(parsed.hashToken);
    } catch {
      await ctx.reply(t(userId, 'invalid_payment'));
      return;
    }

    processingPayments.add(chargeId);

    const bound = findSessionByPayload(payload);
    const boundChatId = bound?.chatId ?? chatId;
    const existingSession = bound?.sess ?? pending.get(chatId);
    const existingMatches =
      Boolean(existingSession) &&
      (existingSession!.starsInvoicePayload === payload || existingSession!.hash === hash);

    const boundSess: PendingSession = existingMatches && existingSession
      ? existingSession
      : {
          sessionId: parsed.sessionId || newSessionId(),
          hash,
          fileName: 'document',
          createdAt: Date.now(),
          state: 'await_payment',
          starsInvoicePayload: payload,
        };

    if (payment.total_amount !== getSessionPricing(boundSess).starsPrice) {
      processingPayments.delete(chargeId);
      await ctx.reply(t(userId, 'invalid_payment'));
      return;
    }

    const canUseSessionMeta = existingMatches;

    boundSess.state = 'processing';
    boundSess.starsPaid = true;
    boundSess.starsChargeId = chargeId;
    boundSess.starsInvoicePayload = payload;
    setSession(boundChatId, boundSess);
    awaitingOwner.delete(boundChatId);

    const fileName = canUseSessionMeta ? boundSess.fileName : 'document';
    const ownerName = canUseSessionMeta ? boundSess.ownerName : undefined;

    await ctx.reply(t(userId, 'payment_received'));

    let success = false;
    const channelKey = boundSess.kind === 'channel_post' ? boundSess.channelKey : undefined;
    let channelLockAcquired = false;

    try {
      if (channelKey) {
        if (channelStamps[channelKey]) {
          markPaymentProcessed(chargeId, payload);
          clearPendingSession(boundChatId);
          await ctx.reply(t(userId, 'channel_stamp_already_done'));
          success = true;
          return;
        }
        if (processingChannelStamps.has(channelKey)) {
          await ctx.reply(t(userId, 'processing_in_progress'));
          return;
        }
        processingChannelStamps.add(channelKey);
        channelLockAcquired = true;
      }

      let txHash: string;
      let txTime: Date;

      const existing = await verifyDocumentHash(hash);
      if (existing.found && existing.txHash && existing.timestamp) {
        txHash = existing.txHash;
        txTime = new Date(existing.timestamp * 1000);
      } else {
        txHash = await sendNotarizationTx(hash, getNotarizationCommentOptions(boundSess), getSessionPricing(boundSess).anchorTon);
        txTime = new Date();
      }

      const explorerUrl = getTonviewerUrl(txHash);
      const vtoken = hashToToken(hash);
      const vlink = makeVerificationLink(vtoken);

      if (boundSess.kind === 'channel_post') {
        const pdf = await generateCertificate({
          fileName,
          documentHash: hash,
          txHash,
          timestamp: txTime,
          ownerName,
          verificationLink: vlink,
          lang: getLang(userId),
        });

        const published = await publishChannelStampProof(ctx, userId, boundSess, txHash, txTime, pdf);
        if (published) {
          await ctx.reply(getChannelStampPrivateDoneMessage(userId, boundSess, txHash), {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          });
        } else {
          await ctx.reply(t(userId, 'channel_stamp_already_done'));
        }
      } else {
        await ctx.api.sendChatAction(chatId, 'upload_document').catch(() => {});
        const pdf = await generateCertificate({
          fileName,
          documentHash: hash,
          txHash,
          timestamp: txTime,
          ownerName,
          verificationLink: vlink,
          lang: getLang(userId),
        });

        await ctx.reply(t(userId, 'hash_recorded', { txHash, explorerUrl }), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
        });

        await ctx.replyWithDocument(new InputFile(pdf, `ProofStamp_${fileName}.pdf`));
      }

      markPaymentProcessed(chargeId, payload);
      if (config.sweepAfterPayment) {
        maybeSweepToTreasury('stars_notarization').catch(() => {});
      }
      clearPendingSession(boundChatId);
      success = true;
    } catch (e) {
      console.error('Error processing stars payment:', e);
      if (isTonRateLimitError(e)) {
        await ctx.reply(t(userId, 'ton_rate_limited_retry'));
      } else {
        await ctx.reply(t(userId, 'error_processing'));
      }
    } finally {
      if (channelKey && channelLockAcquired) {
        processingChannelStamps.delete(channelKey);
      }
      processingPayments.delete(chargeId);

      if (!success && boundSess) {
        const current = pending.get(boundChatId);
        if (current && current.sessionId === boundSess.sessionId) {
          current.state = 'await_payment';
          current.starsPaid = true;
          current.starsChargeId = chargeId;
          current.starsInvoicePayload = payload;
          setSession(boundChatId, current);
          await sendSessionOptions(ctx.api, boundChatId, userId, current).catch(() => {});
        }
      }
    }
  });

  return bot;
}

async function showLanguageSelection(ctx: Context, userId: number): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text('🇬🇧 English', 'set_lang_en')
    .text('🇷🇺 Русский', 'set_lang_ru')
    .row()
    .text('🇪🇸 Español', 'set_lang_es')
    .text('🇧🇷 Português', 'set_lang_pt')
    .row()
    .text('🇩🇪 Deutsch', 'set_lang_de')
    .text('🇫🇷 Français', 'set_lang_fr')
    .row()
    .text('🇹🇷 Türkçe', 'set_lang_tr')
    .text('🇸🇦 العربية', 'set_lang_ar')
    .row()
    .text('🇮🇩 Indonesia', 'set_lang_id')
    .text('🇮🇳 हिंदी', 'set_lang_hi')
    .row()
    .text('🇨🇳 中文', 'set_lang_zh');

  await ctx.reply(t(userId, 'choose_language'), { parse_mode: 'HTML', reply_markup: keyboard });
}
