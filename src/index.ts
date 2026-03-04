import express from 'express';
import { config } from './config';
import { initTon, getWalletAddress } from './ton';
import { createBot } from './bot';

async function main() {
  console.log('Proof Stamp Bot starting...');

  await initTon();
  console.log('TON wallet initialized');

  const app = express();
  app.disable('x-powered-by');

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'proof-stamp-bot',
      wallet: getWalletAddress(),
      network: config.tonNetwork,
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const server = app.listen(config.port, () => {
    console.log(`Health check server on port ${config.port}`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Health check port ${config.port} is already in use. Run only one bot instance.`);
      process.exit(1);
    }
    console.error('Health check server error:', err);
    process.exit(1);
  });

  const bot = createBot();

  bot.catch((err) => {
    const method = (err as any)?.error?.method;
    const description = String((err as any)?.error?.description ?? '').toLowerCase();
    if (
      method === 'answerCallbackQuery' &&
      (description.includes('query is too old') || description.includes('query id is invalid'))
    ) {
      return;
    }
    console.error('Bot error:', err);
  });

  let pollAttempt = 0;
  while (true) {
    try {
      pollAttempt += 1;
      await bot.start({
        drop_pending_updates: config.dropPendingUpdates,
        onStart: () => {
          console.log('Bot is running (long-polling)');
        },
      });
      break;
    } catch (err) {
      const msg = String((err as any)?.message || err);
      const waitMs = Math.min(30_000, 1000 * 2 ** Math.min(pollAttempt, 5));
      console.error(`Long-polling stopped: ${msg}. Retry in ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
