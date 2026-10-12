import React from 'react';
import { QRItem, LayoutConfig } from '../types.ts';
import { Scissors, CheckCircle, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface A4PreviewProps {
  items: QRItem[];
  config: LayoutConfig;
  cardDataUrls: Map<string, string>;
  zoom: number;
  onZoomChange: (z: number) => void;
}

export const A4Preview: React.FC<A4PreviewProps> = ({
  items,
  config,
  cardDataUrls,
  zoom,
  onZoomChange,
}) => {
  const cols = Math.max(1, config.columns);
  const rows = Math.max(1, config.rows);
  const totalSlots = cols * rows;

  // Printable area calculations
  const printableWidthMm = 210 - config.marginMm * 2;
  const printableHeightMm = 297 - config.marginMm * 2;
  const colWidthMm = (printableWidthMm - config.gapMm * (cols - 1)) / cols;
  const rowHeightMm = (printableHeightMm - config.gapMm * (rows - 1)) / rows;
  const qrBoxMm = Math.min(colWidthMm, rowHeightMm);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top status bar & zoom controls */}
      <div className="w-full max-w-[850px] mb-3 flex flex-wrap items-center justify-between gap-3 px-2 text-xs no-print">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            1 Trang A4 duy nhất • Không xếp chồng • Đều đẹp
          </span>
          <span className="hidden sm:inline text-slate-400">
            {totalSlots} mã QR ({cols} cột × {rows} hàng)
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Kích thước: ~{colWidthMm.toFixed(1)} × {rowHeightMm.toFixed(1)} mm
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/60 rounded-lg p-1 text-slate-300">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
            className="p-1.5 hover:bg-slate-700 rounded transition"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-xs text-slate-300 min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            className="p-1.5 hover:bg-slate-700 rounded transition"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(0.85)}
            className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1"
            title="Vừa màn hình"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="text-[11px]">Vừa vặn</span>
          </button>
        </div>
      </div>

      {/* Realistic A4 Page Canvas / Simulation */}
      <div className="w-full overflow-auto flex justify-center py-4 px-2 print:p-0">
        <div
          className="print-page-wrapper transition-transform origin-top"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          {/* A4 Sheet Container: Aspect ratio 210mm x 297mm */}
          <div
            className="a4-print-sheet bg-white text-slate-900 shadow-2xl relative select-none"
            style={{
              width: '210mm',
              height: '297mm',
              minWidth: '210mm',
              minHeight: '297mm',
              padding: `${config.marginMm}mm`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Optional Header Banner */}
            {config.showTitleHeader && config.titleHeader && (
              <div className="w-full text-center pb-2 mb-2 border-b border-slate-200">
                <h2 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                  {config.titleHeader}
                </h2>
              </div>
            )}

            {/* Grid of QR items */}
            <div
              className="w-full h-full"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                columnGap: `${config.gapMm}mm`,
                rowGap: `${config.gapMm}mm`,
                boxSizing: 'border-box',
              }}
            >
              {Array.from({ length: totalSlots }).map((_, idx) => {
                const item = items[idx % items.length];
                const cardImg = cardDataUrls.get(item.id);

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-center p-1 transition-all"
                    style={{
                      border:
                        config.showCutLines && config.cutLineStyle === 'dashed'
                          ? '1px dashed #cbd5e1'
                          : config.showCutLines && config.cutLineStyle === 'dotted'
                          ? '1px dotted #cbd5e1'
                          : config.showCutLines && config.cutLineStyle === 'solid'
                          ? '1px solid #e2e8f0'
                          : '1px solid transparent',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Scissor / Corner Guides if enabled */}
                    {config.showCutLines && config.cutLineStyle === 'corners' && (
                      <>
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-slate-300" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-slate-300" />
                        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-slate-300" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-slate-300" />
                      </>
                    )}

                    {/* Subtle scissor badge on first element as cut hint */}
                    {idx === 0 && config.showCutLines && (
                      <div className="absolute -top-2 -left-2 text-slate-400 opacity-60 no-print flex items-center gap-0.5 text-[9px] font-sans">
                        <Scissors className="w-3 h-3 rotate-90" />
                        <span>Cắt theo viền</span>
                      </div>
                    )}

                    {/* QR Card Presentation */}
                    <div
                      className={`flex flex-col items-center justify-center max-w-full max-h-full ${
                        config.roundedCard ? 'rounded-2xl' : 'rounded-none'
                      } ${
                        config.cardShadow ? 'shadow-md shadow-slate-200/60' : ''
                      } ${
                        config.cardBorder ? 'border border-slate-200' : ''
                      } p-2 bg-white`}
                      style={{
                        backgroundColor: config.cardBgColor || '#ffffff',
                      }}
                    >
                      {cardImg ? (
                        <img
                          src={cardImg}
                          alt={`QR ${idx + 1}`}
                          className="object-contain max-h-full max-w-full"
                          style={{
                            maxWidth: `${qrBoxMm * 0.92}mm`,
                            maxHeight: `${qrBoxMm * 0.92}mm`,
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 animate-pulse rounded" />
                      )}

                      {/* Label if enabled */}
                      {config.showLabel && (item.label || item.content) && (
                        <span
                          className="mt-1 font-semibold text-slate-800 text-center truncate max-w-full px-1"
                          style={{
                            fontSize: `${Math.max(7, Math.min(13, qrBoxMm * 0.16))}pt`,
                            lineHeight: 1.15,
                          }}
                        >
                          {item.label || item.content}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* A4 Page bottom footer line */}
            <div className="w-full pt-1 mt-auto flex justify-between items-center text-[8pt] text-slate-400 border-t border-slate-100 no-print">
              <span>Khổ giấy A4 (210 × 297 mm)</span>
              <span>Được tạo bởi A4 QR Document Studio</span>
              <span>Trang 1/1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
