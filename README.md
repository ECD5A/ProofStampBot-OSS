# ProofStampBot-OSS

Open-source Telegram bot that anchors SHA-256 fingerprints on the TON blockchain and generates a PDF proof certificate.
Payments: Telegram Stars or TON.

## Links

- Telegram bot: https://t.me/ProofStampBot
- Website: https://proofstamp.ru

## What It Does

- Calculates SHA-256 fingerprint for a file/message
- Anchors fingerprint on TON as an on-chain comment: `ProofStamp SHA256:<64-hex>`
- Generates a PDF certificate with QR + transaction link
- Supports stamping workflows for private chat and groups/channels

## Requirements

- Node.js (recommended: Node 20 LTS)
- npm

## Install

```bash
npm ci
cp .env.example .env
# edit .env
npm run build
npm run start
```

## Configuration (`.env`)

Create `.env` from `.env.example`.

Required:

- `BOT_TOKEN` - Telegram bot token
- `TON_SIGNER_MNEMONIC` - 24-word mnemonic (Wallet V5R1). Keep only on server.

Recommended:

- `TONCENTER_API_KEY` - TON API key for better reliability/rate limits
- `TON_NETWORK=mainnet|testnet`

Optional:

- `TON_PAY_WALLET_ADDRESS` - separate wallet address for incoming TON payments
- Pricing: `STARS_PRICE`, `TON_PRICE`
- Limits: `MAX_DOCUMENT_MB`, `FILE_FETCH_TIMEOUT_SEC`
- Group/channel stamping: `CHANNEL_STAMP_ENABLED`, `GROUP_STAMP_MODE`, `GROUP_STAMP_TAG`
- Treasury sweep: `TREASURY_ADDRESS`, `SWEEP_*`

## Health Endpoints

The bot starts a small HTTP server:

- `GET /health` -> `{ "status": "ok" }`
- `GET /` -> status + wallet address + network

Default port: `3000` (via `PORT` in `.env`).

## Telegram Usage

Private chat:

- Send a file as a document (not as a photo)
- Bot computes SHA-256 and asks for payment (Stars or TON)
- After payment confirmation, bot returns a PDF certificate

Verify later:

- Send the same file again and use `/verify`, or use transaction link/QR from the certificate

Groups/channels:

- In groups: reply with `/stamp` to target message, or use configured tag (default: `#stamp`)
- In channels/groups where bot is present: bot can attach `Stamp this post` button for admins
- Payment flow continues in private chat

## Security

- Never commit `.env`, mnemonics, API keys, or private keys
- Runtime data is stored under `./data` (JSON stores) and should not be committed
- Secret scan (if `gitleaks` is installed):

```bash
npm run secrets:scan
```

## Repository Layout

- `src/` - TypeScript source code
- `public/` - landing and web assets
- `assets/fonts/` - bundled fonts and third-party licenses
- `scripts/` - helper and maintenance scripts
- `deploy/` - deployment artifacts

## License

MIT License (see [LICENSE](LICENSE)).

Reference:
- https://opensource.org/license/mit/
- https://spdx.org/licenses/MIT.html

Note: `assets/fonts/` contains third-party fonts with their own license files (`OFL-*.txt`, `LICENSE-NotoCJK.txt`).
