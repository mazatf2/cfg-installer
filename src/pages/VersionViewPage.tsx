import React, {Component} from 'react'
import {
	Avatar,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardSubtitle,
	CardTitle,
	Checkbox,
	Fieldset,
	Form,
	Radio,
	Text,
} from 'react-md'
import {ReposListReleasesResponseData} from '@octokit/types'
import {format} from 'timeago.js'
import {presets} from '../configResources'
import {ghReleaseAsset, mapAddons, mapPresets} from '../../tools/generate_config'
import {presets_desc_en, presets_en, recommended_addons, recommended_preset} from '../data/temp'
//const { presets_desc_en, presets_en, recommended_addons, recommended_preset} = require('./src/data/temp.ts')

interface State {
	selectedPreset: string
	selectedAddons: string[]
}

interface VersionViewProps {
	selectedGithubRelease: ReposListReleasesResponseData | []
	onSelect: (e: ReposListReleasesResponseData) => void
}

export class VersionViewPage extends Component<VersionViewProps, State> {
	state: State
	constructor(props: VersionViewProps) {
		super(props)
		this.state = {
			selectedPreset: recommended_preset,
			selectedAddons: recommended_addons[recommended_preset]
		}
	}

	render() {
		globalThis.state = this.state
		let selectedVersion = this.props.selectedGithubRelease

		if (!selectedVersion[0]) {
			return <div>no release</div>
		}
		const release = selectedVersion[0]

		//console.log(release)
		const userName = release.author.login
		const ago = format(new Date(release.created_at), 'en_US')
		const presetsArr = Object.values(presets)
		const presetAssets = mapPresets(release.assets)
		const addonAssets = mapAddons(release.assets)

		return (
			<Card key={release.id}>
				<CardHeader beforeChildren={
					<Avatar
						src={release.author.avatar_url}
						alt={`${userName}'s avatar`}
					/>
				}>
					<CardTitle>{release.name}</CardTitle>
					<CardSubtitle>{release.author.login} released this {ago}</CardSubtitle>
				</CardHeader>
				<CardContent>

					<Text>.....................................................................</Text>

					<Form>
						<Fieldset legend='Presets'>
							{
								presetAssets.map((preset: ghReleaseAsset) => {
									//console.log(preset)
									return (
										<Radio
											key={preset.name}
											id={preset.name}
											name='presets'
											value={preset.name}
											label={presets_en[preset.name]}
											defaultChecked={preset.name === recommended_preset}
											onChange={(event => this.setState({selectedPreset: event.currentTarget.id, selectedAddons: recommended_addons[event.currentTarget.id]}))}
										/>
									)
								})
							}
						</Fieldset>

						<Fieldset legend='Addons'>
							{
								addonAssets.map((preset: ghReleaseAsset) => {
									//console.log(preset)
									return (
										<Checkbox
											key={preset.name}
											label={preset.name}
											id={preset.name}
											name={preset.name}
											defaultChecked={recommended_addons[recommended_preset].includes(preset.name)}
											checked={this.state.selectedAddons.includes(preset.name)}
											onChange={(event => this.setState({selectedAddons: [event.currentTarget.id]}))}
										/>

									)
								})
							}
						</Fieldset>
					</Form>
				</CardContent>
				<CardActions>
					<Button onClick={() => this.props.onSelect([release])}>install</Button>
				</CardActions>
			</Card>
		)
	}
}