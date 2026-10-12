import { QRItem, LayoutConfig } from '../types.ts';
import { renderQRCardDataUrl } from './qrRenderer.ts';
import { saveAs } from 'file-saver';

// A4 dimensions at 300 DPI:
// 210mm * 300 / 25.4 = 2480 px
// 297mm * 300 / 25.4 = 3508 px
const A4_300DPI_WIDTH = 2480;
const A4_300DPI_HEIGHT = 3508;
const MM_TO_PX_300DPI = 300 / 25.4;

export async function exportA4ToPNG(
  items: QRItem[],
  config: LayoutConfig,
  fileName = 'Trang_A4_In_QR_300DPI.png'
): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = A4_300DPI_WIDTH;
  canvas.height = A4_300DPI_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const marginPx = Math.round(config.marginMm * MM_TO_PX_300DPI);
  const gapPx = Math.round(config.gapMm * MM_TO_PX_300DPI);

  const cols = config.columns;
  const rows = config.rows;
  const printableWidth = canvas.width - marginPx * 2;
  const printableHeight = canvas.height - marginPx * 2;

  const cellWidth = (printableWidth - gapPx * (cols - 1)) / cols;
  const cellHeight = (printableHeight - gapPx * (rows - 1)) / rows;

  const qrBoxSize = Math.min(cellWidth, cellHeight);

  // Render card cache
  const renderedImages = new Map<string, HTMLImageElement>();
  for (const item of items) {
    if (!renderedImages.has(item.id)) {
      const dataUrl = await renderQRCardDataUrl(item, config, Math.round(qrBoxSize * 1.5));
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = dataUrl;
      });
      renderedImages.set(item.id, img);
    }
  }

  const totalSlots = cols * rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const item = items[idx % items.length];
      const img = renderedImages.get(item.id);
      if (!img) continue;

      const cellX = marginPx + c * (cellWidth + gapPx);
      const cellY = marginPx + r * (cellHeight + gapPx);

      // Draw cut lines / borders around cell if enabled
      if (config.showCutLines) {
        ctx.save();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 3;
        if (config.cutLineStyle === 'dashed') {
          ctx.setLineDash([12, 12]);
          ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
        } else if (config.cutLineStyle === 'dotted') {
          ctx.setLineDash([4, 8]);
          ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
        } else if (config.cutLineStyle === 'corners') {
          const cornerLen = 20;
          ctx.setLineDash([]);
          // Top-left
          ctx.beginPath();
          ctx.moveTo(cellX, cellY + cornerLen);
          ctx.lineTo(cellX, cellY);
          ctx.lineTo(cellX + cornerLen, cellY);
          // Top-right
          ctx.moveTo(cellX + cellWidth - cornerLen, cellY);
          ctx.lineTo(cellX + cellWidth, cellY);
          ctx.lineTo(cellX + cellWidth, cellY + cornerLen);
          // Bottom-right
          ctx.moveTo(cellX + cellWidth, cellY + cellHeight - cornerLen);
          ctx.lineTo(cellX + cellWidth, cellY + cellHeight);
          ctx.lineTo(cellX + cellWidth - cornerLen, cellY + cellHeight);
          // Bottom-left
          ctx.moveTo(cellX + cornerLen, cellY + cellHeight);
          ctx.lineTo(cellX, cellY + cellHeight);
          ctx.lineTo(cellX, cellY + cellHeight - cornerLen);
          ctx.stroke();
        } else {
          ctx.setLineDash([]);
          ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
        }
        ctx.restore();
      }

      // Draw centered QR card within cell
      const drawW = qrBoxSize;
      const drawH = config.showLabel && item.label ? qrBoxSize * 1.18 : qrBoxSize;
      const drawX = cellX + (cellWidth - drawW) / 2;
      const drawY = cellY + (cellHeight - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, fileName);
    }
  }, 'image/png');
}
