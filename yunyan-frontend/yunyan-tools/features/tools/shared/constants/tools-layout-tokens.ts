export const toolsLayoutTokens = {
  shell: {
    headerHeightClass: "h-12",
    headerHeightPx: 48,
    headerPaddingClass: "px-2 md:px-3",
    mainPaddingClass: "p-0",
    contentMaxWidthClass: "max-w-none",
  },
  sidebar: {
    expandedWidthClass: "w-[196px]",
    collapsedWidthClass: "w-14",
    expandedPaddingLeftClass: "md:pl-[196px]",
    collapsedPaddingLeftClass: "md:pl-14",
    transitionDurationClass: "duration-180",
    brandHeightClass: "h-12",
    navItemHeightClass: "h-8",
    navSubItemHeightClass: "h-8",
    navIconClass: "size-3.5",
    navSubIconClass: "size-3.5",
  },
  workspace: {
    containerClass:
      "mx-auto w-full max-w-[1360px] space-y-8 px-2 py-4 md:space-y-10 md:px-3 md:py-5 lg:px-4",
    sectionClass: "tools-soft-surface space-y-6 rounded-2xl p-4 md:p-5",
    splitLayoutClass:
      "grid gap-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:items-stretch",
    splitLayoutWideClass:
      "grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] xl:items-stretch",
    previewSplitClass: "grid gap-4 md:items-stretch",
    rightPaneClass: "tools-right-grid-pane h-full rounded-2xl p-2",
    footerClass:
      "tools-word-footer mt-8 rounded-2xl px-4 py-10 md:mt-10 md:px-5 lg:px-6",
    footerContentClass: "space-y-7 md:space-y-8",
  },
  toolsHub: {
    pagePaddingClass: "px-2 pb-3 pt-2 md:px-3 md:pb-4 md:pt-3",
    shellClass: "mx-auto w-full max-w-[1720px] rounded-2xl bg-background",
    sectionGapClass: "space-y-3 md:space-y-4",
    sectionPaddingClass: "p-3 md:p-4",
  },
} as const
