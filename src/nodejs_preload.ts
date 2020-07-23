import os from 'os'
import path from 'path'
import {copyFile, existsSync, mkdir, readFileSync, unlink, writeFile} from 'fs'
import dirTree, {DirectoryTree} from 'directory-tree'
import {toItemTree} from './pages/FolderView/toItemTree'
import {Item} from './pages/FolderView/FolderView'
import {vpk} from './vpk/vpk'
import {shell} from 'electron'
import {sanitizeUrl} from '@braintree/sanitize-url'
import {toCustomFolderResources} from '../tools/generate_config'
import {Buffer} from 'buffer'
import {fetchGithub} from './github/github'

//function nodejs_getHook(): {exist: (tf2Path: string) => Promise<unknown>, handleFileInstall: (urlTarget: string, fileDest: string) => Promise<unknown>, openTagInBrowser: (tag: string) => (undefined | "url error")}
export type nodejs_hook = typeof nodejs_getHook

declare global {
	interface Window {
		nodejs_getHook: nodejs_hook // exported to electron with window
	}
}

// exported to electron with window
const openTagInBrowser = (tag: string) => {
	if (!tag) return

	let urlTemp: string | URL = sanitizeUrl('https://github.com/mastercomfig/mastercomfig/releases/tag/' + tag)
	urlTemp = new URL(urlTemp)

	if (!urlTemp.host) {
		console.error('openTagInBrowser', urlTemp)
		return 'url error'
	}

	const url = urlTemp.toString()
	shell.openExternal(url)
}

const ensureCustomFolder = (tfFolder: string) => {
	return new Promise((resolve, reject) => {

		console.log(path.join(tfFolder, 'custom'))
		const a = mkdir(path.join(tfFolder, 'custom'), (err) => {
			console.log('mkdir', err)

			if (err?.errno !== os.constants.errno.EEXIST) {
				resolve(true)
			} else {
				reject(err)
			}

			resolve(true)
		})
	})
}

const getCustomFiles = (tfFolder: string) => {
	return new Promise((resolve, reject) => {
		// .../Team Fortress 2/tf/custom
		let searchPath = path.join(tfFolder, 'custom')
		console.log(searchPath)

		const tree: DirectoryTree = dirTree(searchPath)

		resolve(tree)
	})
}

// ~/.local/share/Steam/SteamApps/common/Team Fortress 2/tf/custom/a/
// C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2/tf/custom/b/
// =>
// ~/.local/share/Steam/SteamApps/common/Team Fortress 2
// C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2
// check and modify
// if path 'is inside' / 'targets' 'Team Fortress 2' folder
const validateTF2Path = (tf2Path: string) => {
	if (path.isAbsolute(tf2Path) && /Team Fortress 2/.test(tf2Path)) {
		return tf2Path.split(/Team Fortress 2/)[0] + 'Team Fortress 2'
	}
	return ''
}

export interface filesystemItem extends Item {
	version: string
	buffer: Buffer | null
}

// exported to electron with window
const exist = (tf2Path: string) => {
	return new Promise(async (resolve, reject) => {

		tf2Path = validateTF2Path(tf2Path)
		if (!tf2Path) reject('validateTF2Path()')

		const tfFolder = path.join(tf2Path, 'tf')
		const isValid = existsSync(path.join(tfFolder, 'steam.inf'))
		if (!isValid) reject('!isValid')


		const custom = await ensureCustomFolder(tfFolder).catch(err => {
			console.log(err)
			reject(err)
		})
		console.log('custom', custom)

		const dirTree = await getCustomFiles(tfFolder).catch(err => {
			console.log(err)
			reject(err)
		})
		console.log('dirTree', dirTree)

		const itemTree = toItemTree(dirTree as DirectoryTree)
		const thingsOfInterest: filesystemItem[] = Object.values(itemTree)
			.filter(i => {
				if (/mastercomfig/.test(i.name) && i?.extension === '.vpk') {
					return i
				}
			})
			.map(i => {
				return {...i, version: 'unknown', buffer: readFileSync(i.path)}
			})
			.map(i => vpk(i))
		//.map(i => {return {...i, buffer: null}})

		const filesystemResources = toCustomFolderResources(thingsOfInterest)
		console.log('fileList')

		resolve({
			itemTree: itemTree,
			customFolderResources: filesystemResources,
			nodejs_tf2FolderPath: tf2Path,
			customFolderPath: path.join(tf2Path, 'tf/custom'),
		})



	})

}

const backupFile = (filePath: string) => {
	return new Promise((resolve, reject) => {

		const target = path.parse(filePath)
		const isElectron = typeof shell !== 'undefined'

		let backupLocation = ''

		console.log('isElectron', isElectron)
		if (isElectron) {
			backupLocation = path.join(__dirname, 'backups', target.base)
		} else {
			backupLocation = path.join(os.tmpdir(), 'backups' + target.base)
		}
		backupLocation = path.join(os.tmpdir(), 'backups' + target.base)
		//TODO backup folder

		console.log(backupLocation)

		copyFile(filePath, backupLocation, err => {
			if (err) {
				reject(err)
			}
			console.log('copyfile cb')

			resolve(true)
		})
	})
}

const removeFile = (file: string) => {
	return new Promise((resolve, reject) => {

		unlink(file, err => {
			if (err) {
				reject(err)
			}
			console.log('removeFile cb')

			resolve(true)
		})
	})
}

// exported to electron with window
const handleFileInstall = (urlTarget: string, fileDest: string, newFileName: string, oldFileName: string) => {
	return new Promise(async (resolve, reject) => {
		let backupFilePath = ''
		let newFileDest = ''
		let urlTemp: string | URL = sanitizeUrl(urlTarget)
		let url = ''

		urlTemp = new URL(urlTarget)
		if (!urlTemp.host) return reject('url error')

		url = urlTemp.toString()

		fileDest = validateTF2Path(fileDest)
		if(!fileDest) reject('tf2 path error')

		newFileDest = path.join(fileDest, 'tf/custom', newFileName)
		backupFilePath  = path.join(fileDest, 'tf/custom', oldFileName)

		const response = await fetchGithub(url).catch(err => reject(err))
		if(!response) return reject(response)

		console.log('response', response)
		const file = await response.arrayBuffer()
		if(!file) return reject(file)

		const backup = await backupFile(backupFilePath).catch(err => {
			return reject(err)
		})

		if (!backup) {
			return reject('backup err')
		}
		console.log('backup', backup)

		// clean user installed files when overwrite is not enough. etc 'file (2).vpk'
		if(oldFileName !== newFileName){
			await removeFile(backupFilePath).catch(err => {
				return reject(err)
			})
		}

		const buffer = Buffer.from(file)

		// write over
		writeFile(newFileDest, buffer, {flag: 'w'}, err => {
			if (err) {
				console.log(err)
				return reject(removeFile(newFileDest))
			}
			console.log('writeFile cb')

			resolve(true)
		})
	})
}

// exported to electron with window
const nodejs_getHook = () => {
	return {
		handleFileInstall: handleFileInstall,
		exist: exist,
		openTagInBrowser: openTagInBrowser
	}
}

window.nodejs_getHook = nodejs_getHook

/*
let a = 'C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2/tf/custom/test123-nodejs.vpk'
window.writeFile(a, 'aaaaaaaaaaaabc öäå').then(i => {
	console.log(i)
}).catch(err => {
	console.log(err)
})

const test = async () => {
	try {
		let a = 'C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2/tf/custom/test123-nodejs.html'
		const data = await fetchGithub('https://github.com/mazatf2/tf2-stats')
		let write = await window.writeFile(a, data)
		console.log(write)
	} catch (e) {
		console.log(e)
	}
}
test()
*/
console.log('update?')

/*
console.log(window.exist)
let a = 'C:/Program Files (x86)/Steam/steamapps/common/Team Fortress 2'

window.exist(a).then(res => {
	//console.log(res)
}).catch((e)=>{
	console.log('err err err')
	console.error(e)
})

//setInterval(()=>{}, 8000)
*/