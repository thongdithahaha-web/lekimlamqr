import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Upload,
  Grid3X3,
  Sliders,
  Scissors,
  Sparkles,
  Layers,
  Copy,
  Info,
  Type,
  Maximize,
} from 'lucide-react';
import { QRItem, LayoutConfig, PresetLayout, CutLineStyle } from '../types.ts';

interface ControlsProps {
  items: QRItem[];
  onUpdateItems: (items: QRItem[]) => void;
  config: LayoutConfig;
  onUpdateConfig: (config: Partial<LayoutConfig>) => void;
  onExportDocx: () => void;
  onPrint: () => void;
  onExportPNG: () => void;
  isExportingDocx: boolean;
  isExportingPNG: boolean;
}

const PRESETS: PresetLayout[] = [
  {
    id: '6-large',
    name: '6 mã (2 × 3)',
    description: 'Cỡ lớn ~7.2cm • Bảng mica, để bàn',
    columns: 2,
    rows: 3,
    count: 6,
    recommendedGap: 10,
    badge: 'Cỡ lớn',
  },
  {
    id: '8-med-large',
    name: '8 mã (2 × 4)',
    description: 'Cỡ lớn vừa ~6.2cm • Menu, quầy thu ngân',
    columns: 2,
    rows: 4,
    count: 8,
    recommendedGap: 8,
  },
  {
    id: '12-standard',
    name: '12 mã (3 × 4)',
    description: 'Chuẩn đẹp nhất ~5.0cm • Đều đẹp, thoáng, dễ cắt',
    columns: 3,
    rows: 4,
    count: 12,
    recommendedGap: 8,
    badge: 'Phổ biến nhất',
  },
  {
    id: '15-medium',
    name: '15 mã (3 × 5)',
    description: 'Cỡ vừa ~4.1cm • Tem dán sản phẩm',
    columns: 3,
    rows: 5,
    count: 15,
    recommendedGap: 6,
  },
  {
    id: '16-square',
    name: '16 mã (4 × 4)',
    description: 'Vuông đều ~3.9cm • Sticker bao bì',
    columns: 4,
    rows: 4,
    count: 16,
    recommendedGap: 6,
  },
  {
    id: '20-compact',
    name: '20 mã (4 × 5)',
    description: 'Cỡ nhỏ ~3.4cm • Tem nhãn ly trà sữa',
    columns: 4,
    rows: 5,
    count: 20,
    recommendedGap: 5,
    badge: 'Tiết kiệm',
  },
  {
    id: '24-mini',
    name: '24 mã (4 × 6)',
    description: 'Mini ~2.9cm • Dán nắp hộp, vé',
    columns: 4,
    rows: 6,
    count: 24,
    recommendedGap: 4,
  },
];

export const Controls: React.FC<ControlsProps> = ({
  items,
  onUpdateItems,
  config,
  onUpdateConfig,
  onExportDocx,
  onPrint,
  onExportPNG,
  isExportingDocx,
  isExportingPNG,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentItem = items[0] || {
    id: 'default',
    type: 'text',
    content: 'https://instagram.com/_lkimlam',
    label: '@_lkimlam',
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated: QRItem[] = [
        {
          id: `upload-${Date.now()}`,
          type: 'image',
          imageDataUrl: dataUrl,
          content: file.name.replace(/\.[^/.]+$/, ''),
          label: file.name.includes('_lkimlam') ? '@_lkimlam' : file.name.replace(/\.[^/.]+$/, ''),
        },
      ];
      onUpdateItems(updated);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyPreset = (preset: PresetLayout) => {
    onUpdateConfig({
      columns: preset.columns,
      rows: preset.rows,
      gapMm: preset.recommendedGap,
    });
  };

  return (
    <div className="w-full space-y-5 text-sm text-slate-200">
      {/* Primary Export Action Cards */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Xuất & In Ấn Chuẩn A4</h3>
            <p className="text-xs text-indigo-200/70">Không xếp chồng • Khoảng cách đều • Lấp đầy 1 trang</p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Main Docx Export Button */}
          <button
            onClick={onExportDocx}
            disabled={isExportingDocx}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-5 h-5 text-blue-100" />
            <span>{isExportingDocx ? 'Đang tạo file Word...' : 'Tải File Word (.docx) Chuẩn A4'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onPrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>In Ngay / PDF</span>
            </button>

            <button
              onClick={onExportPNG}
              disabled={isExportingPNG}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isExportingPNG ? 'Đang xuất...' : 'Ảnh PNG (300 DPI)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Source QR & Label */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white">Nguồn Mã QR & Nhãn</h4>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentItem.type === 'image' ? 'Ảnh tải lên' : 'Mã tự sinh'}
          </span>
        </div>

        {/* Upload file or change text */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Tải lên ảnh mã QR của bạn (PNG, JPG, WebP)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-600 hover:border-indigo-400 bg-slate-900/50 hover:bg-slate-900 transition text-slate-300 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Chọn ảnh mã QR từ máy tính/điện thoại</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1">
              Đang dùng mã QR Instagram của bạn (<code className="text-indigo-300">_lkimlam</code>). Bạn có thể đổi bất kỳ lúc nào.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nội dung liên kết / Mã QR
            </label>
            <input
              type="text"
              value={currentItem.content}
              onChange={(e) => {
                const updated = [...items];
                updated[0] = {
                  ...currentItem,
                  content: e.target.value,
                  type: 'text',
                  imageDataUrl: undefined,
                };
                onUpdateItems(updated);
              }}
              placeholder="https://instagram.com/_lkimlam hoặc số TK, link..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:outline-none text-white text-xs font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                Chữ hiển thị dưới mã QR
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={config.showLabel}
                  onChange={(e) => onUpdateConfig({ showLabel: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                Hiện nhãn
              </label>
            </div>
            {config.showLabel && (
              <input
                type="text"
                value={currentItem.label || ''}
                onChange={(e) => {
                  const updated = [...items];
                  updated[0] = { ...currentItem, label: e.target.value };
                  onUpdateItems(updated);
                }}
                placeholder="Ví dụ: @_lkimlam, Quét để kết nối, Tên cửa hàng..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:outline-none text-white text-xs"
              />
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Layout Presets & Grid */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white">Bố Cục Lấp Đầy 1 Trang A4</h4>
          </div>
          <span className="text-xs text-indigo-300 font-mono">
            {config.columns * config.rows} mã / trang
          </span>
        </div>

        {/* Preset grid buttons */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 block mb-1">
            Chọn số lượng mã vừa khít 1 trang A4 (không bị tràn sang trang 2):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const isSelected =
                config.columns === preset.columns && config.rows === preset.rows;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border transition relative cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">{preset.name}</span>
                    {preset.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom rows & columns */}
        <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Số cột ({config.columns})
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateConfig({ columns: Math.max(1, config.columns - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="8"
                value={config.columns}
                onChange={(e) =>
                  onUpdateConfig({ columns: Math.max(1, Math.min(8, parseInt(e.target.value) || 1)) })
                }
                className="w-full text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => onUpdateConfig({ columns: Math.min(8, config.columns + 1) })}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Số hàng ({config.rows})
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateConfig({ rows: Math.max(1, config.rows - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="10"
                value={config.rows}
                onChange={(e) =>
                  onUpdateConfig({ rows: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })
                }
                className="w-full text-center py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => onUpdateConfig({ rows: Math.min(10, config.rows + 1) })}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Spacing & Padding Sliders */}
        <div className="space-y-3 pt-2 border-t border-slate-700/60">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Khoảng cách giữa các mã (Gap)</span>
              <span className="font-mono text-indigo-400 font-semibold">{config.gapMm} mm</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={config.gapMm}
              onChange={(e) => onUpdateConfig({ gapMm: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              * Giúp các mã không bị dính sát/khít vào nhau, cực kỳ dễ cắt khi in ra giấy.
            </p>
          </div>

          {/* Individual Page Margins (Top, Bottom, Left, Right like Word Page Setup) */}
          <div className="pt-2 border-t border-slate-700/60 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Canh Lề Trang A4 (Page Margins - Giống Word)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Trên (Top)</span>
                  <span className="font-mono text-indigo-400 font-semibold">{config.marginTopMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={config.marginTopMm}
                  onChange={(e) => onUpdateConfig({ marginTopMm: parseInt(e.target.value) || 0 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Dưới (Bottom)</span>
                  <span className="font-mono text-indigo-400 font-semibold">{config.marginBottomMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={config.marginBottomMm}
                  onChange={(e) => onUpdateConfig({ marginBottomMm: parseInt(e.target.value) || 0 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Trái (Left)</span>
                  <span className="font-mono text-indigo-400 font-semibold">{config.marginLeftMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={config.marginLeftMm}
                  onChange={(e) => onUpdateConfig({ marginLeftMm: parseInt(e.target.value) || 0 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Phải (Right)</span>
                  <span className="font-mono text-indigo-400 font-semibold">{config.marginRightMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={config.marginRightMm}
                  onChange={(e) => onUpdateConfig({ marginRightMm: parseInt(e.target.value) || 0 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cut Lines & Visual Style */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-700 text-slate-300">
            <Scissors className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-white">Đường Viền Cắt & Thẻ QR</h4>
        </div>

        <div className="space-y-3">
          {/* Toggle cut lines */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showCutLines}
                onChange={(e) => onUpdateConfig({ showCutLines: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              Đường viền hướng dẫn cắt (Kéo ✂️)
            </label>
            <span className="text-[11px] text-slate-400">Tiện cắt dán</span>
          </div>

          {config.showCutLines && (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(
                [
                  { id: 'dashed', label: 'Nét đứt' },
                  { id: 'dotted', label: 'Dấu chấm' },
                  { id: 'corners', label: 'Góc cắt +' },
                  { id: 'solid', label: 'Nét liền' },
                ] as { id: CutLineStyle; label: string }[]
              ).map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdateConfig({ cutLineStyle: style.id })}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition cursor-pointer ${
                    config.cutLineStyle === style.id
                      ? 'bg-indigo-600 text-white border-indigo-500 font-medium'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          )}

          {/* Rounded Card Style */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
            <span className="text-xs text-slate-300">Bo góc thẻ QR (giống ảnh mẫu)</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.roundedCard}
                onChange={(e) => onUpdateConfig({ roundedCard: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs text-slate-400">Bo góc</span>
            </label>
          </div>

          {/* Border & Shadow */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Viền nhẹ xung quanh mã</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.cardBorder}
                onChange={(e) => onUpdateConfig({ cardBorder: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs text-slate-400">Bật viền</span>
            </label>
          </div>
        </div>
      </div>

      {/* Helpful info box */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          File Word (<code className="text-slate-300">.docx</code>) được cấu hình chuẩn kích thước A4 (210 × 297mm),
          sử dụng bảng định dạng chính xác từng milimet, đảm bảo khi mở trong Word hoặc gửi in không bao giờ bị nhảy trang
          hoặc xếp đè lên nhau.
        </p>
      </div>
    </div>
  );
};
