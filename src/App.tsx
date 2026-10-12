/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * toolqr - All Rights Reserved
 * Bản quyền thuộc về Lê Kim Lâm.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QRItem, LayoutConfig } from './types.ts';
import { renderQRCardDataUrl, decodeQRFromDataUrl } from './utils/qrRenderer.ts';
import { exportToDocx } from './utils/docxExport.ts';
import { exportA4ToPNG } from './utils/canvasExport.ts';
import { A4Preview } from './components/A4Preview.tsx';
import { Controls } from './components/Controls.tsx';
import {
  FileText,
  Printer,
  QrCode,
  Eye,
  Sliders,
  CheckCircle2,
  FileCheck,
  Upload,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Initial QR item based on the user's uploaded photo (_lkimlam (1).png)
  const [items, setItems] = useState<QRItem[]>([
    {
      id: 'qr-lkimlam',
      type: 'text',
      content: 'https://instagram.com/_lkimlam',
      label: '@_lkimlam',
    },
  ]);

  // Layout Configuration tuned specifically for standard A4 portrait printing
  const [config, setConfig] = useState<LayoutConfig>({
    columns: 3,
    rows: 4,
    marginTopMm: 12,
    marginBottomMm: 12,
    marginLeftMm: 12,
    marginRightMm: 12,
    gapMm: 8,
    showCutLines: true,
    cutLineStyle: 'dashed',
    cutLineColor: '#cbd5e1',
    roundedCard: true,
    cardBorder: true,
    cardShadow: false,
    showLabel: true,
    labelFontSizePt: 10,
    qrColor: '#000000',
    cardBgColor: '#FFFFFF',
    showTitleHeader: false,
    titleHeader: 'Danh Sách Mã QR',
    fillCount: 12,
  });

  const [cardDataUrls, setCardDataUrls] = useState<Map<string, string>>(new Map());
  const [zoom, setZoom] = useState<number>(0.85);
  const [activeTab, setActiveTab] = useState<'preview' | 'controls'>('preview');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Re-render card preview whenever item or visual config changes
  useEffect(() => {
    let isCancelled = false;
    async function updateCardPreviews() {
      const newMap = new Map<string, string>();
      for (const item of items) {
        try {
          const url = await renderQRCardDataUrl(item, config, 600);
          if (!isCancelled) {
            newMap.set(item.id, url);
          }
        } catch (e) {
          console.error('Error rendering QR preview:', e);
        }
      }
      if (!isCancelled) {
        setCardDataUrls(newMap);
      }
    }
    updateCardPreviews();
    return () => {
      isCancelled = true;
    };
  }, [items, config.roundedCard, config.cardBorder, config.cardBgColor, config.qrColor, config.showLabel]);

  // Handle image file ingestion (from upload, drop, or paste)
  const processImageFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const decoded = await decodeQRFromDataUrl(dataUrl);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const label = baseName.includes('lkimlam')
        ? '@_lkimlam'
        : decoded
        ? decoded
        : baseName;

      setItems([
        {
          id: `upload-${Date.now()}`,
          type: 'image',
          imageDataUrl: dataUrl,
          content: decoded || baseName,
          label: label,
        },
      ]);
      showToast(decoded ? `Đã nhận diện mã QR: ${decoded}` : 'Đã tải ảnh mã QR lên thành công!');
    };
    reader.readAsDataURL(file);
  }, []);

  // Global drag-and-drop & paste listeners
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const itemsList = e.clipboardData.items;
      for (let i = 0; i < itemsList.length; i++) {
        if (itemsList[i].type.indexOf('image') !== -1) {
          const file = itemsList[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          processImageFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [processImageFile]);

  const handleUpdateConfig = useCallback((newConfig: Partial<LayoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportToDocx(items, config, 'Bang_Ma_QR_A4_lkimlam.docx');
      showToast('Đã tạo và tải file Word (.docx) chuẩn A4 thành công!');
    } catch (err) {
      console.error('Error generating docx:', err);
      showToast('Có lỗi xảy ra khi tạo file Word. Vui lòng thử lại!');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPNG = async () => {
    try {
      setIsExportingPNG(true);
      await exportA4ToPNG(items, config, 'Trang_In_QR_A4_300DPI.png');
      showToast('Đã tải xuống ảnh A4 (300 DPI) độ nét cao!');
    } catch (err) {
      console.error('Error generating PNG:', err);
      showToast('Có lỗi khi tạo ảnh A4.');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Drag & drop overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-indigo-900/80 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 text-white pointer-events-none">
          <Upload className="w-16 h-16 text-indigo-300 animate-bounce mb-3" />
          <h2 className="text-2xl font-bold">Thả ảnh mã QR vào đây</h2>
          <p className="text-indigo-200 mt-1">Hỗ trợ PNG, JPG, WebP</p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm animate-bounce no-print">
          <FileCheck className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                  toolqr
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-medium">
                  © Lê Kim Lâm
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                toolqr • Sắp xếp & xuất file Word (.docx) mã QR chuẩn A4 • Bản quyền Lê Kim Lâm
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="hidden md:flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="Mở hộp thoại in hoặc lưu PDF chuẩn A4"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>In / Lưu PDF</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-100" />
              <span>{isExportingDocx ? 'Đang xuất Docx...' : 'Tải File Word (.docx)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900/60 no-print">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${
            activeTab === 'preview'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400'
          }`}
        >
          <Eye className="w-4 h-4" />
          Xem Trước Trang A4
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${
            activeTab === 'controls'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Tùy Chỉnh & Bố Cục ({config.columns * config.rows} mã)
        </button>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Configuration */}
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-4 no-print ${
            activeTab === 'controls' ? 'block' : 'hidden lg:block'
          }`}
        >
          <Controls
            items={items}
            onUpdateItems={setItems}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onExportDocx={handleExportDocx}
            onPrint={handlePrint}
            onExportPNG={handleExportPNG}
            isExportingDocx={isExportingDocx}
            isExportingPNG={isExportingPNG}
          />
        </div>

        {/* Right Column: Live Interactive A4 Sheet View */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col items-center print:w-full print:m-0 print:p-0 ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <A4Preview
            items={items}
            config={config}
            cardDataUrls={cardDataUrls}
            zoom={zoom}
            onZoomChange={setZoom}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400 no-print flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>toolqr • Sắp xếp & in mã QR tối ưu khổ giấy A4 • Không xếp chồng</span>
        <span className="hidden sm:inline">•</span>
        <span className="text-indigo-400 font-medium">Bản quyền thuộc về Lê Kim Lâm</span>
      </footer>
    </div>
  );
}
