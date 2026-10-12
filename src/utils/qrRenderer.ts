/**
 * toolqr - All Rights Reserved
 * Bản quyền mã nguồn thuộc về Lê Kim Lâm.
 */

import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QRItem, LayoutConfig } from '../types.ts';

/**
 * Decode a QR code from an image File or Data URL using canvas & jsQR
 */
export async function decodeQRFromDataUrl(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        resolve(code.data);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/**
 * Render a single QR card into a clean high-resolution canvas DataURL
 * suitable for embedding into DOCX or printing.
 */
export async function renderQRCardDataUrl(
  item: QRItem,
  config: LayoutConfig,
  targetWidthPx = 600
): Promise<string> {
  const canvas = document.createElement('canvas');
  const targetHeightPx = config.showLabel && item.label ? Math.round(targetWidthPx * 1.18) : targetWidthPx;
  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Background
  const radius = config.roundedCard ? targetWidthPx * 0.12 : 0;
  ctx.save();
  ctx.fillStyle = config.cardBgColor || '#FFFFFF';

  if (radius > 0) {
    drawRoundedRect(ctx, 4, 4, targetWidthPx - 8, targetHeightPx - 8, radius);
    ctx.fill();
    if (config.cardBorder) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  } else {
    ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
    if (config.cardBorder) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, targetWidthPx - 4, targetHeightPx - 4);
    }
  }
  ctx.restore();

  // QR Content
  const qrBoxSize = Math.round(targetWidthPx * 0.82);
  const qrX = Math.round((targetWidthPx - qrBoxSize) / 2);
  const qrY = config.showLabel && item.label
    ? Math.round(targetWidthPx * 0.08)
    : Math.round((targetHeightPx - qrBoxSize) / 2);

  if (item.type === 'image' && item.imageDataUrl) {
    // Render uploaded image
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        if (config.roundedCard) {
          drawRoundedRect(ctx, qrX, qrY, qrBoxSize, qrBoxSize, radius * 0.5);
          ctx.clip();
        }
        ctx.drawImage(img, qrX, qrY, qrBoxSize, qrBoxSize);
        ctx.restore();
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = item.imageDataUrl!;
    });
  } else {
    // Generate QR using qrcode library
    const tempCanvas = document.createElement('canvas');
    await QRCode.toCanvas(tempCanvas, item.content || 'https://instagram.com/_lkimlam', {
      width: qrBoxSize,
      margin: 1,
      color: {
        dark: config.qrColor || '#000000',
        light: '#FFFFFF00', // transparent so cardBgColor shows
      },
      errorCorrectionLevel: 'M',
    });

    ctx.drawImage(tempCanvas, qrX, qrY, qrBoxSize, qrBoxSize);
  }

  // Label text if enabled
  if (config.showLabel && (item.label || item.content)) {
    const labelText = item.label || item.content;
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.round(targetWidthPx * 0.052);
    ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

    const labelY = qrY + qrBoxSize + Math.round((targetHeightPx - (qrY + qrBoxSize)) / 2);
    // Truncate if too long
    const maxWidth = targetWidthPx * 0.85;
    ctx.fillText(labelText, targetWidthPx / 2, labelY, maxWidth);
    ctx.restore();
  }

  return canvas.toDataURL('image/png', 0.95);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
