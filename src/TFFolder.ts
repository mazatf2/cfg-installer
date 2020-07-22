import {nodejs_hook} from './preload'

export const TFFolder = (hook: nodejs_hook, path: string) => {
	return new Promise(async (resolve, reject) => {
		path = path.replace(/\\/g, '/')

		console.log('got path', path)

		const tf2FolderRE = /Team Fortress 2/
		if (tf2FolderRE.test(path)) {
			const tf2Folder = path.split(/Team Fortress 2/)[0] + 'Team Fortress 2'

			console.log(tf2Folder)

			// @ts-ignore
			const data = await hook.exist(tf2Folder).catch(reject)

			if (data) {
				console.log('got filelist')
				resolve(data)
			} else {
				reject('err')
			}
		} else {
			reject('err')
		}
	})
}