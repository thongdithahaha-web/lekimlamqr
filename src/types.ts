export interface QRItem {
  id: string;
  type: 'image' | 'text';
  imageDataUrl?: string; // If user uploaded an image
  content: string; // If text/URL
  label?: string; // Optional caption e.g. @_lkimlam
  subLabel?: string;
}

export type CutLineStyle = 'none' | 'dashed' | 'dotted' | 'corners' | 'solid';

export interface LayoutConfig {
  columns: number;
  rows: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapMm: number; // space between QR items (default 8mm)
  showCutLines: boolean;
  cutLineStyle: CutLineStyle;
  cutLineColor: string;
  roundedCard: boolean; // rounded card like Instagram QR
  cardBorder: boolean;
  cardShadow: boolean;
  showLabel: boolean;
  labelFontSizePt: number;
  qrColor: string;
  cardBgColor: string;
  titleHeader?: string;
  showTitleHeader: boolean;
  fillCount: number; // Total QRs to display on the page
}

export interface PresetLayout {
  id: string;
  name: string;
  description: string;
  columns: number;
  rows: number;
  count: number;
  recommendedGap: number;
  badge?: string;
}
