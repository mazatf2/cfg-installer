import React from 'react'
import {ResourceAvatar} from './ResourceAvatar'
import {ListItem} from 'react-md'
import {inspectionObj} from '../../inspections/inspections'
import {Link} from '../Link'
import {useRouteMatch} from 'react-router-dom'
import {resources as resourceMapping} from '../../configResources'
import {customFolderResource} from '../../CustomFolderResources/CustomFolderResources'
import {userAction} from '../../App'
import {ResourceUpdateItem} from './ResourceUpdateItem'

interface Props {
	inspections: inspectionObj[]
	userAction: userAction

	resource: customFolderResource
	ghResources: customFolderResource[]
}

export const ResourceListItem = (props: Props) => {
	let {path, url} = useRouteMatch()

	const resource = props.resource
	const inspections = props.inspections

	const latestVersion = inspections.find(i => i.inspection === 'latest_version').version

	const ourInspections = inspections.filter(i => i.path === resource.path)
	const showUpdate = ourInspections.some(i => i.inspection === 'no_old_versions')
	const ourInspectionNames = ourInspections.map(i => i.inspection)

	const humanName = resourceMapping[resource.name]?.name_human ?? resource.fileName

	if (showUpdate) {

		return (
			<ResourceUpdateItem
				humanName={humanName}
				resource={resource}
				userAction={props.userAction}
				isDescription3Lines={true}

				description={
					<>
						{resource.version}<br/>
						<Link
							to={`${url}/rendering`}
							href='#'
							target='_blank'
							onClick={(e) => {
								e.preventDefault()
								props.userAction({action: 'openTagInBrowser', target: resource})
							}}
						>
							What's new in {latestVersion}
						</Link>
					</>
				}
			/>
		)
	}

	return (
		<ListItem
			id={resource.path}
			leftAddon={<ResourceAvatar txt={resource.assetType}/>}
			leftAddonType='avatar'
			rightAddon={<span>⋮</span>}
			secondaryText={resource.version ?? ''}
		>
			{humanName}
			{ourInspectionNames.length > 1 ? `⚠️ ${ourInspectionNames.length}` : ''}
		</ListItem>
	)
}