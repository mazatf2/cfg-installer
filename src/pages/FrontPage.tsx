import React, {Component} from 'react'
import {FileInput, ListSubheader, Text} from 'react-md'
import {tf2FolderPath, userAction} from '../App'
import {FolderViewPage} from './FolderViewPage'
import {itemTree} from './FolderView/FolderView'
import {customFolderResource} from '../CustomFolderResources/CustomFolderResources'
import {inspectionObj} from '../inspections/inspections'
import {ResourceList} from '../components/ResourceList/ResourceList'

interface Props {
	tf2FolderPath: tf2FolderPath
	onPathSelect: (e: tf2FolderPath) => void
	customFolderItemTree: itemTree | null
	inspections: inspectionObj[]
	userAction: userAction

	customFolderResources: customFolderResource[] | null
	ghResources: customFolderResource[] | null
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

		if (!this.props.ghResources) {
			return <div>no gh resources</div>
		}

		const customFolder = this.props.customFolderResources
		const ghResources = this.props.ghResources

		// TODO possible inspection: 'available resources to install'
		// filter installed
		const availableResources = this.props.ghResources
			.filter(i => !customFolder.some(a => a.name === i.name))

		const inspections = this.props.inspections
		//	.reduce((accumulator, i) => {
		//		return {...accumulator, [i.path]: i}
		//	}, {})

		return (
			<div>
				<ResourceList
					subHeader={<ListSubheader>Installed</ListSubheader>}
					inspections={inspections}
					userAction={this.props.userAction}

					resources={customFolder}
					ghResources={ghResources}
				/>
				<ResourceList
					subHeader={<ListSubheader>Avaible</ListSubheader>}
					inspections={inspections}
					userAction={this.props.userAction}

					resources={availableResources}
					ghResources={ghResources}
				/>
				<Text>....</Text>
				DEBUG: emulate folder view page
				<FolderViewPage
					customFolderItemTree={this.props.customFolderItemTree}
				/>
			</div>
		)
	}
}