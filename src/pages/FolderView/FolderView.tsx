import React, {ReactNode, useMemo} from 'react'
import { Tree, TreeData, useTreeItemSelection, useTreeItemExpansion, GetItemProps, BaseTreeItem } from 'react-md'
import {toItemTree} from './toItemTree'

export interface Item extends BaseTreeItem {
	name: string
	type: 'folder' | 'file'
	icon: string
	path: string
	extension: string
}

export type itemTree = TreeData<Item>

interface Props {
	data: itemTree
}

const getItemProps:GetItemProps<Item> = (item) => {
	const { selected, focused, expanded, icon } = item
	let leftAddon: ReactNode = <span>🏷️</span>
	switch (icon) {
		case 'folder':
			leftAddon = expanded ? <span>📂</span> : <span>📁</span>
			break
		case '.vpk':
			leftAddon= <span>📦️</span>
			break
		case '.cache':
			leftAddon= <span>🎛️</span>
			break
		case '.vtf':
			leftAddon= <span>🎨</span>
			break
		case '.cfg':
			leftAddon=<span>⚙️</span>
			break
	}
	return {
		//rightAddon: <button onClick={() =>{console.log(item)}}>test</button>,
		leftAddon,
		expanderIcon: <span>⬇️</span>
	}
}

export const FolderView = (props: Props) => {
	const selection = useTreeItemSelection([], false);
	const expansion = useTreeItemExpansion([]);
	//const data = useMemo(() => toItemTree(props.data), [props.data])

	if(!props.data){
		return <div>Folder</div>
	}

	return (
		<Tree
			id='single-select-tree'
			data={props.data}
			{...selection}
			{...expansion}
			getItemProps={getItemProps}
		/>
	)
}