import type { Screenshot } from '../../../../shared/types/screenshot'
import { PreviewInfo } from './preview-info'
import { PreviewActions } from './preview-actions'

type PreviewSidebarProps = {
  screenshot: Screenshot
  onCopy: () => void
  onSave: () => void
  onSaveAs: () => void
  onShowInFolder: () => void
  onDelete: () => void
}

export function PreviewSidebar({
  screenshot,
  onCopy,
  onSave,
  onSaveAs,
  onShowInFolder,
  onDelete,
}: PreviewSidebarProps) {
  return (
    <aside className="flex flex-col border-l border-zinc-700/50 w-1/3 min-w-96 divide-y divide-zinc-700/50">
      <PreviewInfo screenshot={screenshot} />
      <PreviewActions
        onCopy={onCopy}
        onSave={onSave}
        onSaveAs={onSaveAs}
        onShowInFolder={onShowInFolder}
        onDelete={onDelete}
      />
    </aside>
  )
}
