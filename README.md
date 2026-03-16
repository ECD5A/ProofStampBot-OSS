# ProofStamp Bot (Open Source)

Developer: **ECD5A**  
Bot: [@ProofStampBot](https://t.me/ProofStampBot)  
Website: https://proofstamp.ru

ProofStamp is a Telegram bot for document timestamping on TON.
It calculates SHA-256 fingerprints, writes proof to blockchain, and generates a PDF certificate.
Payments are supported via TON and Telegram Stars.

## Features

- SHA-256 hash notarization on TON
- On-chain comment format: `ProofStamp SHA256:<64-hex>`
- Payment via TON or Telegram Stars
- PDF proof certificate generation (QR + transaction link)
- Group and channel stamp workflows

## Donate

- TON: `pointoncurve.ton`
- BTC: `1ECDSA1b4d5TcZHtqNpcxmY8pBH1GgHntN`
- USDT (TRC20): `TSWcFVfqCp4WCXrUkkzdCkcLnhtFLNN3Ba`

## Requirements

- Node.js (recommended: Node 20 LTS)
- npm

## Quick Start

```bash
npm ci
cp .env.example .env
# edit .env
npm run build
npm run start
```

## Required Environment

Create `.env` based on `.env.example` and set real values.

Required:

- `BOT_TOKEN` - Telegram bot token
- `TON_SIGNER_MNEMONIC` - 24-word mnemonic for signer wallet (Wallet V5R1)

Recommended:

- `TONCENTER_API_KEY` - better reliability / rate limits
- `TON_NETWORK=mainnet|testnet`

## SHA-256 Integrity

Release archive: `releases/proof-stamp-bot-oss-v1.0.0.zip`  
Checksum (SHA-256): `62524673017102e022e8ce6b4930fe65476238c0e4e7e3b4036cb2ad41c3fb2b`

Full file checksums: `FILES_SHA256.txt`

## Security Notes

- Do not commit `.env`, mnemonics, API keys, or private keys
- Runtime data/logs should stay outside git history

## License

MIT License. Full text is in [LICENSE](LICENSE).

References:
- https://opensource.org/license/mit/
- https://spdx.org/licenses/MIT.html
