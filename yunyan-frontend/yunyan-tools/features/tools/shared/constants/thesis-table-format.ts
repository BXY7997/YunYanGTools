export interface ThesisTableStyleSpec {
  topRulePt: number
  midRulePt: number
  bottomRulePt: number
  auxiliaryRulePt: number
  bodyFontPt: number
  captionFontPt: number
  noteFontPt: number
  rowHeightCm: number
  captionMarginTopPt: number
  captionMarginBottomPt: number
}

/**
 * 通用论文三线表样式参数（用于预览和 Word 导出保持一致）
 * 参考：
 * 1) 电子科技大学《研究生学位论文撰写规范》2.4.2（三线表、线宽、字号）
 * 2) CY/T 170-2019《学术出版规范 表格》
 */
export const thesisTableClassicStyle: ThesisTableStyleSpec = {
  topRulePt: 1.5,
  midRulePt: 0.75,
  bottomRulePt: 1.5,
  auxiliaryRulePt: 0.5,
  bodyFontPt: 10.5,
  captionFontPt: 10.5,
  noteFontPt: 9,
  rowHeightCm: 0.6,
  captionMarginTopPt: 12,
  captionMarginBottomPt: 6,
}
