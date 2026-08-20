import type {Messages} from '@misoto22/kioku-ui';

/**
 * The strings the library's own components speak, in Chinese.
 *
 * These are the words a component says on its own account — the label on a
 * dismiss button, the line a pagination control gives a screen reader — and
 * they are the only strings that belong in the library's provider. Page copy
 * lives in the site's own catalogues.
 *
 * The set is replaced whole rather than patched, which is why this is typed as
 * `Messages`: a key added to the library upstream becomes a type error here
 * instead of an English word surfacing mid-sentence on a Chinese page.
 */
export const libraryZh: Messages = Object.freeze({
  back: '返回',
  calendarNextMonth: '下个月',
  calendarPreviousMonth: '上个月',
  carouselNext: '下一张',
  carouselPrevious: '上一张',
  chatToolCallDone: '完成',
  chatToolCallFailed: '失败',
  chatToolCallRunning: '进行中',
  chatTranscriptEmpty: '还没有消息',
  chatWaitingForReply: '正在等待回复',
  close: '关闭',
  commandPaletteEmpty: '没有匹配的命令',
  commandPalettePlaceholder: '搜索命令',
  fileInputEmpty: '尚未选择文件',
  paginationNext: '下一页',
  paginationPrevious: '上一页',
  remove: '移除',
  resizeHandle: '调整面板大小',
  skipToContent: '跳到主要内容',
  typeaheadEmpty: '没有匹配项',
});
