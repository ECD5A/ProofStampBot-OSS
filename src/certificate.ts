import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { tForLang, Lang } from './i18n';
import { getTonviewerUrl } from './ton';

type FontNames = {
  text: string;
  mono: string;
  latin: string;
};

type FontSource = {
  path: string;
  family?: string;
};

const bundledFontsDir = path.join(process.cwd(), 'assets', 'fonts');

function firstExisting(candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

function firstExistingFont(candidates: FontSource[]): FontSource | undefined {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate.path)) return candidate;
  }
  return undefined;
}

function resolveTextFont(lang: Lang): FontSource | undefined {
  const common: FontSource[] = [
    { path: path.join(bundledFontsDir, 'NotoSans-Regular.ttf') },
    { path: path.join('C:', 'Windows', 'Fonts', 'arial.ttf') },
    { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
    { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf' },
    { path: '/System/Library/Fonts/Supplemental/Arial.ttf' },
  ];

  if (lang === 'zh') {
    return firstExistingFont([
      { path: path.join(bundledFontsDir, 'NotoSansCJKsc-Regular.otf') },
      { path: path.join('C:', 'Windows', 'Fonts', 'msyh.ttc'), family: 'MicrosoftYaHei' },
      { path: path.join('C:', 'Windows', 'Fonts', 'msyhl.ttc'), family: 'MicrosoftYaHei' },
      { path: path.join('C:', 'Windows', 'Fonts', 'msyhbd.ttc'), family: 'MicrosoftYaHei' },
      { path: path.join('C:', 'Windows', 'Fonts', 'simsun.ttc'), family: 'SimSun' },
      { path: path.join('C:', 'Windows', 'Fonts', 'SimsunExtG.ttf') },
      { path: path.join('C:', 'Windows', 'Fonts', 'simsunb.ttf') },
      { path: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', family: 'Noto Sans CJK SC' },
      { path: '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc' },
      { path: '/System/Library/Fonts/PingFang.ttc', family: 'PingFang SC Regular' },
      ...common,
    ]);
  }

  if (lang === 'hi') {
    return firstExistingFont([
      { path: path.join(bundledFontsDir, 'NotoSansDevanagari-Regular.ttf') },
      { path: '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf' },
      { path: '/usr/share/fonts/truetype/lohit-devanagari/Lohit-Devanagari.ttf' },
      { path: '/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc' },
      { path: path.join('C:', 'Windows', 'Fonts', 'Nirmala.ttf') },
      { path: path.join('C:', 'Windows', 'Fonts', 'mangal.ttf') },
      { path: path.join('C:', 'Windows', 'Fonts', 'apraj.ttf') },
      ...common,
    ]);
  }

  if (lang === 'ar') {
    return firstExistingFont([
      { path: path.join(bundledFontsDir, 'NotoSansArabic-Regular.ttf') },
      { path: path.join('C:', 'Windows', 'Fonts', 'segoeui.ttf') },
      { path: '/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf' },
      { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
      { path: '/System/Library/Fonts/Supplemental/Arial Unicode.ttf' },
      ...common,
    ]);
  }

  return firstExistingFont(common);
}

function resolveLatinFont(): string | undefined {
  return firstExisting([
    path.join(bundledFontsDir, 'NotoSans-Regular.ttf'),
    path.join('C:', 'Windows', 'Fonts', 'arial.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
  ]);
}

function resolveMonoFont(): string | undefined {
  return firstExisting([
    path.join(bundledFontsDir, 'NotoSansMono-Regular.ttf'),
    path.join('C:', 'Windows', 'Fonts', 'consola.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf',
    '/System/Library/Fonts/Menlo.ttc',
  ]);
}

function configureFonts(doc: PDFKit.PDFDocument, lang: Lang): FontNames {
  const textFont = resolveTextFont(lang);
  const latinFontPath = resolveLatinFont();
  const monoFontPath = resolveMonoFont();

  let text = 'Helvetica';
  let mono = 'Courier';
  let latin = 'Helvetica';

  if (textFont) {
    doc.registerFont('proof_text', textFont.path, textFont.family);
    text = 'proof_text';
  }

  if (latinFontPath) {
    doc.registerFont('proof_latin', latinFontPath);
    latin = 'proof_latin';
  }

  if (monoFontPath) {
    doc.registerFont('proof_mono', monoFontPath);
    mono = 'proof_mono';
  }

  return { text, mono, latin };
}

export async function generateCertificate(params: {
  fileName?: string;
  documentHash: string;
  txHash: string;
  timestamp: Date;
  ownerName?: string;
  verificationLink?: string;
  explorerUrl?: string;
  lang?: Lang;
}): Promise<Buffer> {
  const { fileName, documentHash, txHash, timestamp, ownerName, verificationLink, explorerUrl, lang } = params;

  const resolvedFileName = (fileName || 'document').trim() || 'document';
  const resolvedExplorerUrl = explorerUrl || getTonviewerUrl(txHash);
  const certLang: Lang = lang || 'en';
  const tr = (key: string) => tForLang(certLang, key);
  const certificateId = documentHash.slice(0, 12).toUpperCase();
  const displayDate = timestamp.toISOString().replace('T', ' ').replace('.000Z', 'Z');

  const qrExplorerDataUrl = await QRCode.toDataURL(resolvedExplorerUrl, { width: 200, margin: 1 });
  const qrExplorerBuffer = Buffer.from(qrExplorerDataUrl.split(',')[1], 'base64');

  const qrVerifyBuffer =
    verificationLink
      ? Buffer.from((await QRCode.toDataURL(verificationLink, { width: 160, margin: 1 })).split(',')[1], 'base64')
      : null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: { Title: 'ProofStamp Certificate', Author: 'ProofStamp' },
    });

    const fonts = configureFonts(doc, certLang);

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentX = doc.page.margins.left;
    const contentW = pageWidth - doc.page.margins.left - doc.page.margins.right;
    const compactId = (value: string, head: number, tail: number): string => {
      if (value.length <= head + tail + 1) return value;
      return `${value.slice(0, head)}...${value.slice(-tail)}`;
    };
    const isAsciiPrintable = (ch: string): boolean => {
      const cp = ch.codePointAt(0) ?? 0;
      return cp >= 0x20 && cp <= 0x7e;
    };
    const splitMixedSegments = (value: string, baseFont: string): Array<{ font: string; text: string }> => {
      if (!value) return [];
      if (baseFont === fonts.mono) return [{ font: baseFont, text: value }];

      const segments: Array<{ font: string; text: string }> = [];
      for (const ch of Array.from(value)) {
        const font = isAsciiPrintable(ch) ? fonts.latin : baseFont;
        const prev = segments[segments.length - 1];
        if (prev && prev.font === font) {
          prev.text += ch;
        } else {
          segments.push({ font, text: ch });
        }
      }
      return segments;
    };
    const measureMixedWidth = (value: string, fontName: string, fontSize: number): number => {
      let total = 0;
      for (const seg of splitMixedSegments(value, fontName)) {
        doc.font(seg.font).fontSize(fontSize);
        total += doc.widthOfString(seg.text);
      }
      return total;
    };
    const normalizeInlineText = (value: string, fallback = '-'): string => {
      return (value || '').replace(/\s+/g, ' ').trim() || fallback;
    };
    const normalizeParagraphText = (value: string, fallback = '-'): string => {
      return (value || '').replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim() || fallback;
    };
    const fitSingleLine = (value: string, fontName: string, fontSize: number, width: number): string => {
      const normalized = normalizeInlineText(value);
      if (measureMixedWidth(normalized, fontName, fontSize) <= width) return normalized;
      let left = 0;
      let right = normalized.length;
      while (left < right) {
        const mid = Math.floor((left + right + 1) / 2);
        const candidate = `${normalized.slice(0, mid)}...`;
        if (measureMixedWidth(candidate, fontName, fontSize) <= width) left = mid;
        else right = mid - 1;
      }
      return `${normalized.slice(0, left)}...`;
    };
    const countWrappedLines = (height: number, fontName: string, fontSize: number, lineGap: number): number => {
      doc.font(fontName).fontSize(fontSize);
      const lineHeight = doc.currentLineHeight(true) + lineGap;
      return Math.max(1, Math.round(height / Math.max(1, lineHeight)));
    };
    const fitWrappedText = (args: {
      value: string;
      fontName: string;
      maxFontSize: number;
      minFontSize: number;
      width: number;
      maxHeight: number;
      maxLines: number;
      lineGap: number;
      step?: number;
    }): { text: string; fontSize: number; height: number } => {
      const text = normalizeParagraphText(args.value);
      const step = args.step ?? 0.2;
      let size = args.maxFontSize;

      while (size >= args.minFontSize - 0.001) {
        doc.font(args.fontName).fontSize(size);
        const h = doc.heightOfString(text, { width: args.width, lineGap: args.lineGap });
        const lines = countWrappedLines(h, args.fontName, size, args.lineGap);
        if (h <= args.maxHeight + 0.1 && lines <= args.maxLines) {
          return { text, fontSize: size, height: h };
        }
        size -= step;
      }

      doc.font(args.fontName).fontSize(args.minFontSize);
      let candidate = text;
      while (candidate.length > 1) {
        const h = doc.heightOfString(candidate, { width: args.width, lineGap: args.lineGap });
        const lines = countWrappedLines(h, args.fontName, args.minFontSize, args.lineGap);
        if (h <= args.maxHeight + 0.1 && lines <= args.maxLines) {
          return { text: candidate, fontSize: args.minFontSize, height: h };
        }
        const lastSpace = candidate.lastIndexOf(' ');
        candidate = lastSpace > 0 ? candidate.slice(0, lastSpace).trim() : candidate.slice(0, -1).trim();
      }

      return { text: normalizeInlineText(text), fontSize: args.minFontSize, height: doc.currentLineHeight(true) };
    };
    const drawMixedSingleLine = (args: {
      value: string;
      x: number;
      y: number;
      width: number;
      fontName: string;
      fontSize: number;
      color: string;
      align?: 'left' | 'center';
    }): void => {
      const fitted = fitSingleLine(args.value, args.fontName, args.fontSize, args.width);
      const segments = splitMixedSegments(fitted, args.fontName);
      const totalWidth = measureMixedWidth(fitted, args.fontName, args.fontSize);
      let cursorX = args.align === 'center' ? args.x + Math.max(0, (args.width - totalWidth) / 2) : args.x;

      for (const seg of segments) {
        doc.fillColor(args.color).font(seg.font).fontSize(args.fontSize);
        doc.text(seg.text, cursorX, args.y, { lineBreak: false });
        cursorX += doc.widthOfString(seg.text);
      }
    };

    const tonBlue = '#0098EA';
    const drawPageFrame = () => {
      doc.rect(0, 0, pageWidth, pageHeight).fill('#F4F7FB');
      doc.roundedRect(24, 24, pageWidth - 48, pageHeight - 48, 12).lineWidth(1).strokeColor('#D7E2EE').stroke();
    };
    const drawSecurityPattern = () => {
      // Dense diagonal watermark pattern (banknote-style).
      doc.save();
      doc.opacity(0.12);
      doc.fillColor('#0079C2');
      doc.font(fonts.latin).fontSize(14);
      doc.rotate(-28, { origin: [pageWidth / 2, pageHeight / 2] });
      for (let yMark = -pageHeight; yMark < pageHeight * 2; yMark += 46) {
        for (let xMark = -pageWidth; xMark < pageWidth * 2; xMark += 172) {
          doc.text('PROOFSTAMP // TON', xMark, yMark, { lineBreak: false });
        }
      }
      doc.restore();

      // Subtle node network motif to reference blockchain.
      doc.save();
      doc.opacity(0.2);
      doc.strokeColor('#77BFEA').lineWidth(0.8);
      for (let x = 42; x < pageWidth - 42; x += 72) {
        const yTop = 150 + ((x / 72) % 2) * 8;
        const yBot = pageHeight - 118 - ((x / 72) % 2) * 8;
        doc.moveTo(x, yTop).lineTo(x + 28, yTop + 16).stroke();
        doc.circle(x, yTop, 1.5).fill('#77BFEA');
        doc.circle(x + 28, yTop + 16, 1.5).fill('#77BFEA');
        doc.moveTo(x - 8, yBot).lineTo(x + 22, yBot - 18).stroke();
        doc.circle(x - 8, yBot, 1.5).fill('#77BFEA');
        doc.circle(x + 22, yBot - 18, 1.5).fill('#77BFEA');
      }
      doc.restore();
    };

    // Background and frame
    drawPageFrame();
    drawSecurityPattern();
    doc.opacity(1);

    // Header band
    const headerY = 34;
    const headerH = 88;
    doc.roundedRect(34, headerY, pageWidth - 68, headerH, 10).fill('#0B1F33');
    doc.rect(34, headerY + headerH - 4, pageWidth - 68, 4).fill(tonBlue);
    const titleText = tr('cert_title');
    const subtitleText = tr('cert_subtitle');
    drawMixedSingleLine({
      value: titleText,
      x: contentX,
      y: headerY + 22,
      width: contentW - 170,
      fontName: fonts.text,
      fontSize: 28,
      color: '#FFFFFF',
    });
    const subtitleWidth = contentW - 190;
    const subtitleY = headerY + 57;
    const subtitleLayout = fitWrappedText({
      value: subtitleText,
      fontName: fonts.text,
      maxFontSize: 11,
      minFontSize: 8.6,
      width: subtitleWidth,
      maxHeight: 24,
      maxLines: 2,
      lineGap: 1,
    });
    doc.fillColor('#C7D8EA').font(fonts.text).fontSize(subtitleLayout.fontSize).text(subtitleLayout.text, contentX, subtitleY, {
      width: subtitleWidth,
      lineGap: 1,
      align: 'left',
    });

    const badgeW = 138;
    const badgeH = 44;
    const badgeX = pageWidth - doc.page.margins.right - badgeW;
    const badgeY = headerY + 22;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 8).fill('#12314D');
    doc.fillColor('#9EC3E8').font(fonts.latin).fontSize(8).text('CERTIFICATE ID', badgeX + 10, badgeY + 8, {
      width: badgeW - 20,
      align: 'center',
    });
    doc.fillColor('#FFFFFF').font(fonts.mono).fontSize(11).text(certificateId, badgeX + 10, badgeY + 21, {
      width: badgeW - 20,
      align: 'center',
    });
    doc.fillColor('#8DD5FF').font(fonts.latin).fontSize(7).text('TON VERIFIED', badgeX + 10, badgeY + 36, {
      width: badgeW - 20,
      align: 'center',
      lineBreak: false,
    });

    const hasOwner = Boolean(ownerName && ownerName.trim());
    let includeOwner = hasOwner;
    let includeVerifyCard = Boolean(verificationLink);

    const cardsTop = headerY + headerH + 16;
    const footerH = 52;
    const qrSectionH = verificationLink && qrVerifyBuffer ? 188 : 172;
    const qrY = pageHeight - doc.page.margins.bottom - footerH - qrSectionH;
    const cardsBottom = qrY - 12;
    const cardsAvailable = cardsBottom - cardsTop;

    const cardCount = () => 5 + (includeOwner ? 1 : 0) + (includeVerifyCard ? 1 : 0);
    const cardsHeight = (scale: number) => {
      const rowH = 42 * scale;
      const rowGap = 8 * scale;
      const c = cardCount();
      return c * rowH + Math.max(0, c - 1) * rowGap;
    };

    let scale = 1;
    while (cardsHeight(scale) > cardsAvailable && scale > 0.74) scale -= 0.04;
    if (cardsHeight(scale) > cardsAvailable && includeVerifyCard) {
      includeVerifyCard = false;
      scale = 1;
      while (cardsHeight(scale) > cardsAvailable && scale > 0.74) scale -= 0.04;
    }
    if (cardsHeight(scale) > cardsAvailable && includeOwner) {
      includeOwner = false;
      scale = 1;
      while (cardsHeight(scale) > cardsAvailable && scale > 0.68) scale -= 0.04;
    }

    const rowH = 42 * scale;
    const rowGap = 8 * scale;
    const padX = 10 * scale;
    const labelSize = Math.max(7.1, 8.8 * scale);
    const valueSize = Math.max(8, 10.6 * scale);
    const monoSize = Math.max(7.2, 9.2 * scale);
    const valueW = contentW - padX * 2;

    const rows: Array<{ label: string; value: string; mono?: boolean; link?: string }> = [
      { label: tr('cert_file'), value: resolvedFileName },
      ...(includeOwner ? [{ label: tr('cert_owner'), value: ownerName!.trim() }] : []),
      { label: tr('cert_hash'), value: documentHash, mono: true },
      { label: tr('cert_tx'), value: txHash, mono: true },
      { label: tr('cert_date'), value: displayDate },
      { label: tr('cert_explorer'), value: resolvedExplorerUrl, mono: true, link: resolvedExplorerUrl },
      ...(includeVerifyCard && verificationLink ? [{ label: tr('cert_verify'), value: verificationLink, mono: true, link: verificationLink }] : []),
    ];

    let y = cardsTop;
    for (const row of rows) {
      doc.roundedRect(contentX, y, contentW, rowH, 8).fillAndStroke('#FFFFFF', '#D7E2EE');

      // Repeat watermark in each card so it stays visible above page background.
      doc.save();
      doc.opacity(0.14);
      doc.fillColor('#0079C2');
      doc.font(fonts.latin).fontSize(Math.max(7.6, 9.6 * scale));
      doc.rotate(-12, { origin: [contentX + contentW / 2, y + rowH / 2] });
      const wmY = y + rowH / 2 - 3 * scale;
      for (let xMark = contentX - 8; xMark < contentX + contentW + 40; xMark += 104 * scale) {
        doc.text('PROOFSTAMP // TON', xMark, wmY, { lineBreak: false });
      }
      doc.restore();

      const labelFont = fonts.text;
      const labelText = fitSingleLine(row.label, labelFont, labelSize, valueW);
      const rawValue = row.mono && (row.value === txHash || row.value === documentHash) ? row.value : row.value;
      const valueFont = row.mono ? fonts.mono : fonts.text;
      const valueText = fitSingleLine(rawValue, valueFont, row.mono ? monoSize : valueSize, valueW);
      drawMixedSingleLine({
        value: labelText,
        x: contentX + padX,
        y: y + 6 * scale,
        width: valueW,
        fontName: labelFont,
        fontSize: labelSize,
        color: '#475569',
      });
      if (row.link) {
        doc.fillColor('#0B63CE')
          .font(valueFont)
          .fontSize(row.mono ? monoSize : valueSize)
          .text(valueText, contentX + padX, y + 6 * scale + labelSize + 4 * scale, {
            width: valueW,
            lineBreak: false,
            link: row.link,
            underline: true,
          });
      } else {
        drawMixedSingleLine({
          value: valueText,
          x: contentX + padX,
          y: y + 6 * scale + labelSize + 4 * scale,
          width: valueW,
          fontName: valueFont,
          fontSize: row.mono ? monoSize : valueSize,
          color: '#0F172A',
        });
      }

      y += rowH + rowGap;
    }

    // QR section (always on same page)
    doc.roundedRect(contentX, qrY, contentW, qrSectionH, 8).fillAndStroke('#FFFFFF', '#D7E2EE');
    doc.save();
    doc.opacity(0.16);
    doc.fillColor('#0079C2');
    doc.font(fonts.latin).fontSize(9.5);
    doc.rotate(-10, { origin: [contentX + contentW / 2, qrY + qrSectionH / 2] });
    for (let xMark = contentX - 10; xMark < contentX + contentW + 32; xMark += 100) {
      doc.text('PROOFSTAMP // TON', xMark, qrY + 102, { lineBreak: false });
    }
    doc.restore();
    doc.fillColor('#475569').font(fonts.latin).fontSize(8.8).text('SCAN TO VERIFY', contentX + 12, qrY + 10, {
      lineBreak: false,
    });

    const explorerQrSize = verificationLink && qrVerifyBuffer ? 128 : 142;
    const explorerQrX = contentX + 12;
    const explorerQrY = qrY + 28;
    doc.image(qrExplorerBuffer, explorerQrX, explorerQrY, { width: explorerQrSize });
    const certExplorerText = tr('cert_explorer');
    const certVerifyText = tr('cert_verify');
    drawMixedSingleLine({
      value: certExplorerText,
      x: explorerQrX,
      y: explorerQrY + explorerQrSize + 6,
      width: explorerQrSize,
      fontName: fonts.text,
      fontSize: 8.5,
      color: '#334155',
      align: 'center',
    });

    const verifyQrSize = 106;
    const verifyQrX = contentX + contentW - verifyQrSize - 12;
    const verifyQrY = qrY + 40;
    let infoX = explorerQrX + explorerQrSize + 14;
    let infoW = contentW - (infoX - contentX) - 12;

    if (verificationLink && qrVerifyBuffer) {
      doc.image(qrVerifyBuffer, verifyQrX, verifyQrY, { width: verifyQrSize });
      drawMixedSingleLine({
        value: certVerifyText,
        x: verifyQrX,
        y: verifyQrY + verifyQrSize + 6,
        width: verifyQrSize,
        fontName: fonts.text,
        fontSize: 8.2,
        color: '#334155',
        align: 'center',
      });
      infoW = verifyQrX - infoX - 10;
    }

    const txCompact = compactId(txHash, 20, 14);
    const hashCompact = compactId(documentHash, 20, 14);
    const explorerCompact = fitSingleLine(resolvedExplorerUrl, fonts.mono, 7.5, infoW);

    const certTxLabel = `${tr('cert_tx')}:`;
    const certHashLabel = `${tr('cert_hash')}:`;
    const certExplorerLabel = `${tr('cert_explorer')}:`;
    drawMixedSingleLine({
      value: certTxLabel,
      x: infoX,
      y: qrY + 34,
      width: infoW,
      fontName: fonts.text,
      fontSize: 9.2,
      color: '#0F172A',
    });
    doc.fillColor('#1E293B').font(fonts.mono).fontSize(8.2).text(txCompact, infoX, qrY + 47, { width: infoW, lineBreak: false });
    drawMixedSingleLine({
      value: certHashLabel,
      x: infoX,
      y: qrY + 77,
      width: infoW,
      fontName: fonts.text,
      fontSize: 9.2,
      color: '#0F172A',
    });
    doc.fillColor('#1E293B').font(fonts.mono).fontSize(8.2).text(hashCompact, infoX, qrY + 90, { width: infoW, lineBreak: false });
    drawMixedSingleLine({
      value: certExplorerLabel,
      x: infoX,
      y: qrY + 120,
      width: infoW,
      fontName: fonts.text,
      fontSize: 8.6,
      color: '#0F172A',
    });
    doc.fillColor('#0B63CE').font(fonts.mono).fontSize(7.5).text(explorerCompact, infoX, qrY + 132, {
      width: infoW,
      link: resolvedExplorerUrl,
      underline: true,
      lineBreak: false,
    });

    const footerRaw = tr('cert_footer');
    const footerFont = fonts.text;
    const footerY = pageHeight - doc.page.margins.bottom - footerH + 6;
    const footerLayout = fitWrappedText({
      value: footerRaw,
      fontName: footerFont,
      maxFontSize: 7.9,
      minFontSize: 6.4,
      width: contentW,
      maxHeight: footerH - 10,
      maxLines: 3,
      lineGap: 1.2,
    });
    doc.fillColor('#475569').font(footerFont).fontSize(footerLayout.fontSize).text(footerLayout.text, contentX, footerY, {
      width: contentW,
      lineGap: 1.2,
      align: 'left',
    });
    doc.end();
  });
}

