import {hot} from 'react-hot-loader'
import React, {Component} from 'react'
import {fetchGitHubReleases} from './github/github'
import {errors} from './errors'
import {ReposListReleasesResponseData} from '@octokit/types'
import {FrontPage} from './pages/FrontPage'
import {TFFolder} from './TFFolder'
import {DirectoryTree} from 'directory-tree'
import {itemTree} from './pages/FolderView/FolderView'
import {inspectionObj, Inspections} from './inspections/inspections'
import {customFolderResource, CustomFolderResources,} from './CustomFolderResources/CustomFolderResources'

export type tf2FolderPath = string
export type dirTree = DirectoryTree | null

interface State {
	errors: React.ReactNode[]
	warnings: React.ReactNode[]
	githubReleases: ReposListReleasesResponseData | [] //ghAssets, githubAssets
	//selectedGithubRelease: ReposListReleasesResponseData | []
	electron_tf2FolderPath: tf2FolderPath
	nodejs_tf2FolderPath: tf2FolderPath

	customFolderItemTree: itemTree | null
	inspections: inspectionObj[]

	customFolderResources: customFolderResource[] | null
	ghResources: customFolderResource[] | null
}

interface Props {

}

type openTagAction = { action: 'openTagInBrowser', target: customFolderResource }
type updateAction = { action: 'update', target: customFolderResource }
type debugAction = { action: 'debug', target: { debug: any } }

type actions = openTagAction | updateAction | debugAction

export type userAction = (event: actions) => void

class App extends Component<Props, State> {
	state: State

	constructor(props: Props) {
		super(props)
		this.state = {
			errors: [],
			warnings: [],
			githubReleases: [],
			//selectedGithubRelease: [],
			electron_tf2FolderPath: '', // user input: path/to/Team Fortress 2/x/y
			nodejs_tf2FolderPath: '', // validated: path/to/Team Fortress 2
			customFolderItemTree: null,
			inspections: [],

			// from CustomFolderResources(filesystem)
			customFolderResources: null,
			// from CustomFolderResources(gh api release.assets). think ghRelease.assets as tf/custom folder files. but they are just on internet
			// could be called: customFolderResourcesInternet
			ghResources: null,

		}
	}

	async componentDidMount() {

		const res = await fetchGitHubReleases().catch(() => {
			this.setState({errors: [errors.github_releases]})
		})

		if (res) {
			const data = res.data ?? []
			this.setState({
				githubReleases: data,
				ghResources: CustomFolderResources(data[0].assets),
			})
			console.log(this.state)
			console.log('github releases api', data)
		}
	}

	onVersionSelect = (ev: ReposListReleasesResponseData) => {
		//this.setState({ghResources: })
	}

	onUserAction = (ev: actions) => {
		console.log(ev)
		const action = ev.action
		const hook = window.nodejs_getHook()

		if (!this.state.ghResources) return

		if (action === 'update') {
			ev = ev as updateAction

			const oldFile = ev.target
			const name = ev.target.name
			const updateTo = this.state.ghResources.find(i => i.name === name)
			if (!updateTo) return

			console.log('update', ev.target, '=>', updateTo)

			hook.handleFileInstall(updateTo.path, this.state.nodejs_tf2FolderPath, updateTo.fileName, oldFile.fileName)
				.then(value => {
					console.log(value)
				})
				.catch(err => {
					console.log(err)
				})

		}

		if (action === 'openTagInBrowser') {
			hook.openTagInBrowser(this.state.ghResources[0].version)
		}
	}

	async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
		if (prevState.electron_tf2FolderPath !== this.state.electron_tf2FolderPath) {

			const hook = window.nodejs_getHook()
			const data = await TFFolder(hook, this.state.electron_tf2FolderPath).catch(console.error)
			if (data) {
				this.setState({
					customFolderItemTree: data.itemTree,
					customFolderResources: data.customFolderResources,
					inspections: Inspections(data.customFolderResources, this.state.ghResources),
					nodejs_tf2FolderPath: data.nodejs_tf2FolderPath,
				})

			}
		}
	}

	render() {
		window.state = this.state
		return (
			<>
				{/*FIXME validate user input, onPathSelect */}
				<FrontPage
					tf2FolderPath={this.state.electron_tf2FolderPath}
					onPathSelect={e => this.setState({electron_tf2FolderPath: e})}
					customFolderItemTree={this.state.customFolderItemTree}
					inspections={this.state.inspections}
					customFolderResources={this.state.customFolderResources}
					ghResources={this.state.ghResources}
					userAction={event => this.onUserAction(event)}
				/>

				<div>
					{this.state.errors ?? <br/>}
				</div>
			</>

		)
	}
}

export default hot(module)(App)
