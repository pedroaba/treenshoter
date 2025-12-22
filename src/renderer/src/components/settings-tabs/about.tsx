import { Info, User } from "lucide-react"
import IconPNG from "../../assets/icon.png"

export function AboutTab() {
	return (
		<div className="h-full w-full p-4 pt-2">
			<div className="max-w-2xl">
				<div className="mb-3">
					<h2 className="text-xl font-bold text-zinc-50">About</h2>
					<p className="text-zinc-400 text-xs">
						Application information and details
					</p>
				</div>

				<div className="space-y-3">
					{/* App Info Card */}
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 shadow-sm">
						<div className="flex items-center gap-3 mb-3">
							<img
								src={IconPNG}
								alt="Screenshoter Icon"
								className="size-12 rounded-lg"
							/>
							<div className="flex-1">
								<h3 className="text-xl font-bold text-zinc-50 mb-0.5">
									Screenshoter
								</h3>
								<p className="text-xs text-zinc-400">
									Version 1.0.0
								</p>
							</div>
						</div>
						<p className="text-sm text-zinc-300 leading-relaxed">
							Screenshoter is a powerful and intuitive screenshot tool designed
							for productivity and ease of use. Capture your screen instantly
							with a global keyboard shortcut, choose between fullscreen or
							custom area selection, and manage all your screenshots in a
							beautiful library interface. The app runs seamlessly in the
							background, ready to capture at a moment's notice, and
							automatically saves your screenshots while copying them to your
							clipboard for immediate use.
						</p>
						<p className="text-sm text-zinc-300 leading-relaxed mt-2">
							With realtime library updates, you can browse, organize, and
							manage your entire screenshot collection. Customize your save
							location, view detailed metadata, and access your captures
							instantly. Built with performance and simplicity in mind,
							Screenshoter provides a minimal yet feature-rich experience for
							all your screen capture needs.
						</p>
					</div>

					{/* Author Info */}
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 shadow-sm">
						<div className="flex items-start gap-3 mb-3">
							<div className="p-2 bg-zinc-800 rounded-md shrink-0">
								<User className="size-4 text-zinc-300" />
							</div>
							<div className="flex-1 min-w-0">
								<label className="text-sm font-medium text-zinc-100 block mb-1">
									Author
								</label>
								<p className="text-sm text-zinc-400">
									pedroaba
								</p>
								<p className="text-xs text-zinc-500 mt-1">
									pedr.augustobarbosa.aparecido@gmail.com
								</p>
							</div>
						</div>
					</div>

					{/* Features */}
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 shadow-sm">
						<div className="flex items-start gap-3 mb-3">
							<div className="p-2 bg-zinc-800 rounded-md shrink-0">
								<Info className="size-4 text-zinc-300" />
							</div>
							<div className="flex-1 min-w-0">
								<label className="text-sm font-medium text-zinc-100 block mb-2">
									Features
								</label>
								<ul className="space-y-1.5 text-sm text-zinc-300">
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Global shortcut activation (Cmd/Ctrl+Shift+S) for instant access
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Fullscreen and partial screen capture modes with intuitive selection
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Screenshot library with realtime updates and automatic synchronization
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Automatic clipboard copying for immediate use in other applications
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Customizable save directory to organize your screenshots
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Floating dock interface for quick mode selection
										</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 mt-1">•</span>
										<span>
											Complete capture history with metadata and timestamps
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
