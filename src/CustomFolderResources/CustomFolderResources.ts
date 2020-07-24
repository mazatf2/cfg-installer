import {presets_display_order} from '../configResources'
import semver from 'semver/preload'
import {filesystemItem} from 'nodejs_preload.ts'

//extracted from, removed [] from: type x = {...}[]
//import {ReposListReleaseAssetsResponseData} from '@octokit/types'
export type ghReleaseAsset = {
	url: string;
	browser_download_url: string;
	id: number;
	node_id: string;
	name: string;
	label: string;
	state: string;
	content_type: string;
	size: number;
	download_count: number;
	created_at: string;
	updated_at: string;
	uploader: {
		login: string;
		id: number;
		node_id: string;
		avatar_url: string;
		gravatar_id: string;
		url: string;
		html_url: string;
		followers_url: string;
		following_url: string;
		gists_url: string;
		starred_url: string;
		subscriptions_url: string;
		organizations_url: string;
		repos_url: string;
		events_url: string;
		received_events_url: string;
		type: string;
		site_admin: boolean;
	};
}

export type assetType = 'preset' | 'addon' | 'template'

export interface customFolderResource {
	fileName: string, // autoexec_template.cfg, mastercomfig-medium-preset.vpk
	//label: string,
	//name: string,
	//download_url: string,
	assetType: string | assetType //todo rename to resourceType
	version: string | 'unknown'

	path: string // filesystem / gh download url
	name: string // is value set to quality or addon or template

	quality: string // medium-high
	addon: string // lowmem
	template: string // autoexec
}

export type configOrder = string[]

const presetsOrder: configOrder = presets_display_order

/*
	"name": "mastercomfig-medium-high-preset.vpk",
	"label": "mastercomfig medium high preset",
	=> medium high

	"name": "mastercomfig-no-soundscapes-addon.vpk",
	"label": "mastercomfig no soundscapes addon",
	=> no soundscapes

	"name": "autoexec_template.cfg",
	"label": "autoexec template",
	=> autoexec template
 */

export const reList = [
	/mastercomfig (.+) preset/,
	/mastercomfig (.+) addon/,
	/(.+template)$/,
]

export const reResourceFilenames = [
	/mastercomfig-(?<quality>.+)-(?<assetType>preset)/,
	/mastercomfig-(?<addon>.+)-(?<assetType>addon)/,
	/(?<template>.+)_(?<assetType>template)/, // autoexec_template.cfg
]

export const reFilename = /(?:.+\/)(?<filename>.+)/
// gh browser_download_url
// https://github.com/mastercomfig/mastercomfig/releases/download/8.103.0/mastercomfig-medium-low-preset.vpk
export const reBrowserUrl = /(?:.+\/)(?<version>.+)\/(?<filename>.+)/

export const presetTemplate = (i: ghReleaseAsset | filesystemItem) => {

	let version = ''
	let fileName = ''
	let path = ''

	// filesystemItem
	if ('path' in i) {
		let unixPath = i.path.replace(/\\/g, '/')
		fileName = reFilename.exec(unixPath)?.[1] ?? ''

		version = i.version
		path = i.path

	}

	// github api Asset
	if ('browser_download_url' in i) {
		const [, capturedVersion, capturedFileName] = reBrowserUrl.exec(i.browser_download_url)

		if (capturedVersion && semver.valid(capturedVersion)) {
			version = capturedVersion
		}
		if (!capturedFileName) console.log(i)
		if (capturedFileName) {
			fileName = capturedFileName

		}

		path = i.browser_download_url
	}

	if (!fileName) {
		throw fileName
	}

	let extend = {quality: '', addon: '', template: '', assetType: ''}

	const reExtend = reResourceFilenames.find(re => re.test(fileName))
	if (reExtend) {
		const temp = reExtend.exec(fileName)
		// @ts-ignore
		extend = {...temp?.groups}
	}

	//github api
	if (fileName === 'template.zip') {
		extend.assetType = 'template'
		extend.template = 'user-template'
	}

	// filesystemItem
	if (fileName === 'user') {
		extend.assetType = 'template'
		extend.template = 'user-template'
	}

	const names = [extend.quality, extend.addon, extend.template].find(i => i && i !== '')

	const result: customFolderResource = {
		name: names ?? fileName,
		fileName: fileName,
		version: version,
		path: path,
		...extend,
	}

	return result
}

// [{name: 'foo'}, ...].reduce(index_by_name, {}) converts to {foo: {name: 'foo'}, ...}
export const index_by_name = (accumulator: {}, asset: ghReleaseAsset) => {
	return {...accumulator, [asset.name]: asset}
}

// all new/unknown entries gets placed to last
const sortBy = (a: customFolderResource, b: customFolderResource, order: configOrder) => {
	let A = order.indexOf(a.name)
	let B = order.indexOf(b.name)

	if (A === -1) {
		A = 100
	}

	if (B === -1) {
		B = 100
	}

	// A comes before B
	// place A higher than B
	// high < low
	// high < new/unknown entry
	if (A < B) {
		return -1
	}

	if (A > B) {
		return 1
	}

	return 0
}

type resource = ghReleaseAsset[] | filesystemItem[]

export const mapPresets = (asset: resource): customFolderResource[] => {
	// @ts-ignore
	return asset.filter(i => /preset/.test(i.name))
		.map(i => presetTemplate(i))
		.sort((a, b) => sortBy(a, b, presetsOrder))

}

export const mapAddons = (asset: resource): customFolderResource[] => {
	// @ts-ignore
	return asset.filter(i => /addon/.test(i.name))
		.map(i => presetTemplate(i))
		.sort((a, b) => a.name - b.name)
}

export const mapTemplates = (asset: resource): customFolderResource[] => {
	// @ts-ignore
	return asset.filter(i => /template/.test(i.name))
		.map(i => presetTemplate(i))
		.sort((a, b) => a.name - b.name)
}

export const CustomFolderResources = (i: resource): customFolderResource[] => {
	return [...mapPresets(i), ...mapAddons(i), ...mapTemplates(i)]
}

