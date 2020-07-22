import React, {Component} from 'react'
import {FolderView, itemTree} from './FolderView/FolderView'
import {dirTree, tf2FolderPath} from '../App'

interface State {

}

interface Props {
	customFolderItemTree: itemTree | null
}

export class FolderViewPage extends Component<Props, State> {
	state: State

	constructor(props: Props) {
		super(props)
	}

	render = () => {
		window.props2 = this.props
		if (!this.props.customFolderItemTree) {
			return <div>folder view page || no item tree</div>
		}

		return (<div>
			FolderView

			<div>...........</div>

			<FolderView
				data={this.props.customFolderItemTree}
			/>

		</div>)

	}
}