import React, {Component} from 'react'
import {Button, FileInput, Text, List, ListSubheader, ListItem} from 'react-md'
import {tf2FolderPath, dirTree, userAction} from '../App'
import {FolderViewPage} from './FolderViewPage'
import {itemTree} from './FolderView/FolderView'
import {customFolderResource} from '../../tools/generate_config'
import {inspectionObj} from '../inspections/inspections'
import {ResourceAvatar} from '../components/ResourceAvatar'
import {ResourceComponent} from '../components/ResourceComponent'
import {ReposListReleasesResponseData} from '@octokit/types'

interface Props {
	tf2FolderPath: tf2FolderPath
	onPathSelect: (e: tf2FolderPath) => void
	customFolderItemTree: itemTree | null
	inspections: inspectionObj[]
	githubReleases: ReposListReleasesResponseData | []

	customFolderResources: customFolderResource[] | null
	ghResources: customFolderResource[] | null

	userAction: userAction
}

export class FrontPage extends Component<Props> {

	constructor(props: Props) {
		super(props)

	}

	render() {
		if (!this.props.tf2FolderPath) {
			return (
				<div>
					<Text>
						Select Team Fortress 2 folder
					</Text>

					<FileInput
						id='select-tf-folder'
						webkitdirectory='true'
						onChange={e =>
							this.props.onPathSelect(e.currentTarget.files?.[0].path ?? '')
						}
					/>
				</div>
			)
		}
		if (!this.props.customFolderItemTree) {
			return <div>no item tree</div>
		}

		if (!this.props.customFolderResources) {
			return <div>no filesystem assets</div>
		}

		if(!this.props.ghResources) {
			return <div>no gh resources</div>
		}

		const customFolder = this.props.customFolderResources


		//filter installed
		const availableResources = this.props.ghResources
			.filter(i => !customFolder.some(a => a.name === i.name))

		const inspections = this.props.inspections
		//	.reduce((accumulator, i) => {
		//		return {...accumulator, [i.path]: i}
		//	}, {})

		return (
			<div>
				<List>
					<ListSubheader>Installed</ListSubheader>

					{customFolder.map(i => {
							return (
								<ResourceComponent
									resource={i}
									inspections={inspections}
									key={i.path}
									ghResources={this.props.ghResources}
									userAction={this.props.userAction}
								/>
							)
						},
					)}
					<ListSubheader>Available</ListSubheader>
					{
						availableResources.map(i => {
							return (
								<ResourceComponent
									resource={i}
									inspections={inspections}
									key={i.path}
									ghResources={this.props.githubReleases}
								/>
							)
						})
					}
				</List>
				<Text>....</Text>
				DEBUG: emulate folder view page
				<FolderViewPage
					tf2FolderPath={this.props.tf2FolderPath}
					customFolderItemTree={this.props.customFolderItemTree}
				/>
			</div>
		)
	}
}