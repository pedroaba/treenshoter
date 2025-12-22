import type { Screenshot } from '../../../../shared/types/screenshot'
import { FileUtils } from '../../utils/file'

type PreviewInfoProps = {
  screenshot: Screenshot
}

export function PreviewInfo({ screenshot }: PreviewInfoProps) {
  const displayTitle = screenshot.title || `Screenshot #${screenshot.id}`

  const infos = [
    {
      label: 'Dimensions',
      value: `${screenshot.width} x ${screenshot.height}`,
    },
    {
      label: 'Size',
      value: FileUtils.formatFileSize(screenshot.size),
    },
    {
      label: 'Created At',
      value: FileUtils.formatDate(screenshot.timestamp),
    },
    {
      label: 'Path',
      value: screenshot.filepath,
    },
  ]

  return (
    <>
      <div className="p-4 flex flex-col gap-2 justify-start items-start">
        <h2 className="text-2xl font-medium text-zinc-200" id="preview-title">
          {displayTitle}
        </h2>
        <div className="text-sm text-zinc-400" id="preview-filename">
          {FileUtils.getFilename(screenshot.filepath)}
        </div>
      </div>

      <div className="p-4 flex flex-col justify-start items-start">
        {infos.map((info) => (
          <div
            key={info.label}
            className="flex justify-between items-center w-full gap-2"
          >
            <span className="text-sm text-zinc-400">{info.label}</span>
            <span
              className="text-sm text-zinc-200 truncate"
              id={info.label.toLowerCase()}
            >
              {info.value}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
