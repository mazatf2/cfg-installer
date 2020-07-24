import React from 'react'
import {ResourceAvatar} from './ResourceAvatar'
import {ListItem, Button} from 'react-md'
import {inspectionObj} from '../inspections/inspections'
import {ReposListReleasesResponseData} from '@octokit/types'
import {Link} from './Link'
import { useRouteMatch } from 'react-router-dom'
import {resources} from '../configResources'
import {customFolderResource} from '../CustomFolderResources/CustomFolderResources'
import { userAction } from '../App'

interface Props {
	resource: customFolderResource
	inspections: inspectionObj[]
	ghResources: customFolderResource[]
	userAction: userAction
}

export const ResourceComponent = (props: Props) => {
	const resource = props.resource
	const inspections = props.inspections

	const ourInspections = inspections.filter(i => i.path === resource.path)
	const showUpdate = ourInspections.some(i => i.inspection === 'no_old_versions')

	const version = resource.version ?? ''
	const ghLatest = props.ghResources[0]

	let { path, url } = useRouteMatch();
	if(!resource.name){
		console.log('!resource.name', resource)
	}

	const name = resources[resource.name]?.name_human ?? resource.fileName

	if (showUpdate) {
		// extract to <Update Resource Row>
		const latestVersion = props.ghResources.find(i=> i.name==='ultra').version
		const updateTo = props.ghResources.find(i=> i.name===resource.name)
		console.log(updateTo, resource)

		const description = <>
			{version}<br/>
			<Link
				to={`${url}/rendering`}
				href='#'
				target='_blank'
				onClick={(e)=> {
					e.preventDefault()
					props.userAction({action: 'openTagInBrowser', target: resource})
				}}
			>
				What's new in {latestVersion}
			</Link>
		</>
		return (
			<ListItem
				id={resource.path}
				leftAddon={<ResourceAvatar txt={resource.assetType}/>}
				leftAddonType='avatar'
				rightAddon={
					<Button
						onClick={(e)=>{
							props.userAction({action: 'update', target: resource})
						}}
					>Update</Button>
				}
				secondaryText={description}
				threeLines

			>
				{name}
				{inspections?.[resource.path]?.inspection ?? ''}
			</ListItem>

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
			{name}
			{inspections?.[resource.path]?.inspection ?? ''}
		</ListItem>
	)
}