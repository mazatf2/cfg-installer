import React, {ReactNode} from 'react'
import {ResourceAvatar} from './ResourceAvatar'
import {Button, ListItem} from 'react-md'
import {customFolderResource} from '../../CustomFolderResources/CustomFolderResources'
import {userAction} from '../../App'

interface Props {
	humanName: string
	description: ReactNode
	isDescription3Lines: boolean
	userAction: userAction
	resource: customFolderResource
}

export const ResourceUpdateItem = (props: Props) => {
	const resource = props.resource

	return (
		<ListItem
			id={resource.path}
			leftAddon={<ResourceAvatar txt={resource.assetType}/>}
			leftAddonType='avatar'
			rightAddon={
				<Button
					onClick={(e) => {
						props.userAction({action: 'update', target: resource})
					}}
				>Update</Button>
			}
			secondaryText={props.description}
			threeLines={props.isDescription3Lines}
		>
			{props.humanName}
		</ListItem>
	)
}