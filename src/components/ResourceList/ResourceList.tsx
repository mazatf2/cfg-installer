import React, {ReactNode} from 'react'
import {List} from 'react-md'
import {ResourceListItem} from './ResourceListItem'
import {customFolderResource} from '../../CustomFolderResources/CustomFolderResources'
import {inspectionObj} from '../../inspections/inspections'
import {userAction} from '../../App'

interface Props {
	subHeader: ReactNode
	inspections: inspectionObj[]
	userAction: userAction

	resources: customFolderResource[] // filesystem
	ghResources: customFolderResource[]
}

export const ResourceList = (props: Props) => {

	return (
		<div>
			<List>
				{props.subHeader}

				{
					props.resources.map(i => {
						return (
							<ResourceListItem
								resource={i}
								inspections={props.inspections}

								ghResources={props.ghResources}
								userAction={props.userAction}
								key={i.path}
							/>
						)
					})
				}
			</List>
		</div>
	)
}