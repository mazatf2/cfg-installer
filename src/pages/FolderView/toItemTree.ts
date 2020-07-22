import {Item, itemTree} from './FolderView'
import {DirectoryTree} from 'directory-tree'

let viewOrder = ['folder', '.vpk', '.cfg', '.cache']

const fileTypes = {
	directory: 'folder',
	file: 'file',
}

const iconTypes = {
	'.vpk': '.vpk',
	'.cache': '.cache',
	'.vtf': '.vtf',
	'.cfg': '.cfg',
	directory: 'folder',
	file: 'file',
}

const folderFirst = (a, b) => {
	let A = viewOrder.indexOf(a.icon)
	let B = viewOrder.indexOf(b.icon)

	if (A === -1) {
		viewOrder.push(a.icon)
		A = viewOrder.indexOf(a.icon)
	}
	if (B === -1) {
		viewOrder.push(b.icon)
		B = viewOrder.indexOf(b.icon)
	}

	return A - B
}

export const toItemTree = (data: DirectoryTree) => {
	if (!data || !data.children) {
		return {}
	}

	const t = data.children.sort(folderFirst)
	let idNum = 0
	let result: Item[] = []

	const convert = (i) => {
		let path = i.path.replace(/\\/g, '/')
		let id = path.split('Team Fortress 2/tf/custom/')[1]
		let parentId = id.split('/' + i.name)[0]

		idNum += 1

		if (id === parentId) {
			parentId = null
		}

		result.push({
			//key: path + result.length,
			parentId: parentId,
			itemId: id,
			name: i.name,
			type: fileTypes[i.type],
			icon: [iconTypes[i.extension], iconTypes[i.type], null].find(i => i !== undefined),
			path: path,
			extension: i.extension,
		} as Item)

		if (i.children) {
			i.children.sort(folderFirst).forEach(convert)
		}
	}
	t.forEach(convert)

	type obj<T> = {
		[key: string]: T
	}

	//{path: Item}
	let temp:obj<Item> = result
		.sort(folderFirst)
		.reduce(((accumulator, i) => {
			return {...accumulator, [i.itemId]: i}
		}), {})

	return temp as itemTree

}


