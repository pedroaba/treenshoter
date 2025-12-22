import { Copy, Download, Folder, Save, Trash } from 'lucide-react'
import { ActionButton } from '../action-button'

type PreviewActionsProps = {
  onCopy: () => void
  onSave: () => void
  onSaveAs: () => void
  onShowInFolder: () => void
  onDelete: () => void
}

export function PreviewActions({
  onCopy,
  onSave,
  onSaveAs,
  onShowInFolder,
  onDelete,
}: PreviewActionsProps) {
  return (
    <div className="p-4 flex flex-col justify-start items-start gap-4">
      <span className="text-base text-zinc-400">Actions</span>
      <div className="grid grid-cols-2 gap-2 w-full">
        <ActionButton variant="primary" id="btn-copy" onClick={onCopy}>
          <Copy className="size-4" />
          Copy
        </ActionButton>
        <ActionButton variant="primary" id="btn-save" onClick={onSave}>
          <Save className="size-4" />
          Save
        </ActionButton>
        <ActionButton
          id="btn-save-as"
          style={{ gridColumn: 'span 2' }}
          onClick={onSaveAs}
        >
          <Download className="size-4" />
          Save As
        </ActionButton>
        <ActionButton
          id="btn-folder"
          style={{ gridColumn: 'span 2' }}
          onClick={onShowInFolder}
        >
          <Folder className="size-4" />
          Show in Folder
        </ActionButton>
        <ActionButton
          variant="danger"
          id="btn-delete"
          style={{ gridColumn: 'span 2' }}
          onClick={onDelete}
        >
          <Trash className="size-4" />
          Delete
        </ActionButton>
      </div>
    </div>
  )
}
