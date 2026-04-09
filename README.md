# ProofStamp Bot (Open Source)

Bot: [@ProofStampBot](https://t.me/ProofStampBot)

ProofStamp is a Telegram bot for cryptographic anchoring on TON.
It works with files, documents, and posts, records SHA-256 on-chain, and generates a PDF certificate with QR and transaction link.
For posts in groups and channels, the bot supports two modes: proof only, or proof together with the full original post text in TON.

## Features

- SHA-256 anchoring for files and documents
- Group and channel post stamping
- Optional `Proof + text` mode for posts
- Payment via TON and Telegram Stars
- PDF certificate generation with QR + transaction link
- Multi-language interface
- Pricing stored in `config/pricing.json`

## Screenshots

<p align="center">
  <img src="assets/screenshots/bot-info-start.jpg" alt="Bot info card" width="220" />
  <img src="assets/screenshots/bot-welcome-languages.jpg" alt="Welcome and language selection" width="220" />
</p>

<p align="center">
  <img src="assets/screenshots/bot-payment-flow.jpg" alt="Payment flow" width="220" />
  <img src="assets/screenshots/certificate-preview.jpg" alt="Certificate preview" width="220" />
</p>

## On-Chain Comment Format

Standard file/document proof:

```text
ProofStamp
SHA256:<64-hex>
```

Post proof with full text:

```text
ProofStamp
Post SHA256:<64-hex>
Text SHA256:<64-hex>

Post text:
<original post text>
```

## Pricing Configuration

Prices are configured in `config/pricing.json`.

Current example:

```json
{
  "standard": {
    "stars": 15,
    "ton": 0.15,
    "anchorTon": 0.1
  },
  "postText": {
    "stars": 59,
    "ton": 0.59,
    "anchorTon": 0.59
  }
}
```

## Quick Start

```bash
npm ci
cp .env.example .env
# edit .env
# edit config/pricing.json if needed
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

- Repository checksums: `FILES_SHA256.txt`
- Release checksums: `RELEASE_CHECKSUMS.txt`
- `FILES_SHA256.txt` is generated from raw file bytes in the checked-out repository and excludes itself to avoid recursive mismatch

## Security Notes

- Do not commit `.env`, mnemonics, API keys, or private keys
- Runtime data and logs should stay outside git history

## Donate

- TON: `pointoncurve.ton`
- BTC: `1ECDSA1b4d5TcZHtqNpcxmY8pBH1GgHntN`
- USDT (TRC20): `TSWcFVfqCp4WCXrUkkzdCkcLnhtFLNN3Ba`

## Disclaimer

This repository is provided as a reference implementation only.

- No active development is planned
- No support or issue handling is guaranteed
- Pull requests may be ignored or declined

Feel free to fork, modify, and use it for your own purposes.

## License

MIT License. Full text is in [LICENSE](LICENSE).
