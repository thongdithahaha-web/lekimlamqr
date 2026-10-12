/**
 * toolqr - All Rights Reserved
 * Bản quyền mã nguồn thuộc về Lê Kim Lâm.
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeightRule,
} from 'docx';
import { saveAs } from 'file-saver';
import { QRItem, LayoutConfig } from '../types.ts';
import { renderQRCardDataUrl } from './qrRenderer.ts';

// 1 mm = 56.6929 dxa (Twips / twentieths of a point)
const MM_TO_DXA = 56.6929;
const A4_WIDTH_DXA = Math.round(210 * MM_TO_DXA); // 11906
const A4_HEIGHT_DXA = Math.round(297 * MM_TO_DXA); // 16838

export async function exportToDocx(
  items: QRItem[],
  config: LayoutConfig,
  fileName = 'Danh_sach_QR_Trang_A4.docx'
): Promise<void> {
  const marginTopDxa = Math.round(config.marginTopMm * MM_TO_DXA);
  const marginBottomDxa = Math.round(config.marginBottomMm * MM_TO_DXA);
  const marginLeftDxa = Math.round(config.marginLeftMm * MM_TO_DXA);
  const marginRightDxa = Math.round(config.marginRightMm * MM_TO_DXA);

  const printableWidthDxa = A4_WIDTH_DXA - marginLeftDxa - marginRightDxa;
  const printableHeightDxa = A4_HEIGHT_DXA - marginTopDxa - marginBottomDxa;

  const cols = Math.max(1, config.columns);
  const rows = Math.max(1, config.rows);
  const totalSlots = cols * rows;

  // Prepare full list of items for the page (repeat if single or cycle through items)
  const pageItems: QRItem[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const item = items[i % items.length];
    pageItems.push(item);
  }

  // Calculate cell dimensions
  const colWidthDxa = Math.floor(printableWidthDxa / cols);
  const rowHeightDxa = Math.floor(printableHeightDxa / rows);

  // Calculate image size in points for ImageRun (1 pt = 20 dxa)
  const cellWidthPt = colWidthDxa / 20;
  const cellHeightPt = rowHeightDxa / 20;

  // Account for gap/padding in mm
  const gapPt = (config.gapMm * MM_TO_DXA) / 20;
  const maxImgWidthPt = Math.max(20, cellWidthPt - gapPt * 1.5);
  const maxImgHeightPt = Math.max(20, cellHeightPt - gapPt * 1.5 - (config.showLabel ? 16 : 0));
  const imgSizePt = Math.min(maxImgWidthPt, maxImgHeightPt);

  // Render high-res images for each unique item to avoid redundant canvas renders
  const itemCache = new Map<string, Uint8Array>();
  for (const item of items) {
    if (!itemCache.has(item.id)) {
      const dataUrl = await renderQRCardDataUrl(item, config, 600);
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        bytes[j] = binaryString.charCodeAt(j);
      }
      itemCache.set(item.id, bytes);
    }
  }

  // Border style for cut guides
  const borderOption = config.showCutLines
    ? {
        style: config.cutLineStyle === 'dotted' ? BorderStyle.DOTTED : BorderStyle.DASHED,
        size: 6,
        color: 'CBD5E1',
      }
    : {
        style: BorderStyle.NONE,
        size: 0,
        color: 'FFFFFF',
      };

  const tableRows: TableRow[] = [];

  for (let r = 0; r < rows; r++) {
    const cells: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const item = pageItems[idx];
      const imgBuffer = itemCache.get(item.id) || new Uint8Array();

      const cellChildren: Paragraph[] = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 240 },
          children: [
            new ImageRun({
              data: imgBuffer,
              type: 'png',
              transformation: {
                width: Math.round(imgSizePt),
                height: Math.round(imgSizePt * (config.showLabel && item.label ? 1.18 : 1)),
              },
            }),
          ],
        }),
      ];

      cells.push(
        new TableCell({
          width: {
            size: colWidthDxa,
            type: WidthType.DXA,
          },
          margins: {
            top: Math.round((config.gapMm * MM_TO_DXA) / 4),
            bottom: Math.round((config.gapMm * MM_TO_DXA) / 4),
            left: Math.round((config.gapMm * MM_TO_DXA) / 4),
            right: Math.round((config.gapMm * MM_TO_DXA) / 4),
          },
          borders: {
            top: borderOption,
            bottom: borderOption,
            left: borderOption,
            right: borderOption,
          },
          children: cellChildren,
        })
      );
    }

    tableRows.push(
      new TableRow({
        height: {
          value: rowHeightDxa,
          rule: HeightRule.ATLEAST,
        },
        children: cells,
      })
    );
  }

  const docTable = new Table({
    width: {
      size: printableWidthDxa,
      type: WidthType.DXA,
    },
    alignment: AlignmentType.CENTER,
    rows: tableRows,
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4_WIDTH_DXA,
              height: A4_HEIGHT_DXA,
            },
            margin: {
              top: marginTopDxa,
              bottom: marginBottomDxa,
              left: marginLeftDxa,
              right: marginRightDxa,
            },
          },
        },
        children: [docTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
