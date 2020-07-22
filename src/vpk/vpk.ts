// budget version

import {filesystemItem} from '../preload'

export const vpk = (i: filesystemItem) => {

	const fileStr = i.buffer?.toString() ?? ''
	let	version = getPresetVersion(fileStr) ?? 'unknown'

	return {
		...i,
		version: version,
		buffer: null,
	}

}

const getPresetVersion = (fileStr: string) => {
	return /alias version_comfig(?: "|")echo mastercomfig version: (.+) \|/g.exec(fileStr)?.[1] ?? 'unknown'
}