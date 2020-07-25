import {compare, valid} from 'semver'
import {assetType, customFolderResource} from '../CustomFolderResources/CustomFolderResources'

type inspectionType = 'error' | 'notice-signal'

// tabular data
export type inspectionObj = {
	inspection:     string
	type:           inspectionType
	path:           string 		| null
	assetType:      assetType 	| null
	version:        string 		| null
}

type inspectionObjBase = {
	inspection:     string
	type:           inspectionType
	path?:          string 		| null
	assetType?:     assetType 	| null
	version?:       string 		| null
}

const newIspection = (merge: inspectionObjBase): inspectionObj => {
	return {
		...{
			path: null,
			assetType: null,
			version: null,
		},
		...merge,
	}
}

export const Inspections = (customFolderResources: customFolderResource[] | null, ghResources: customFolderResource[] | null): inspectionObj[] => {
	const inspections: inspectionObj[] = []

	if (!customFolderResources || !ghResources) {
		console.error('!filesystemAssets')
		return inspections
	}

	for (const i of customFolderResources) {
		let results = [
			no_old_versions(i, ghResources),
			no_multiple_same_resources(i, customFolderResources),
		]

		results = results.filter(r => r && r?.inspection)

		if (results)
			inspections.push(...results)
	}

	const presets = customFolderResources
		.filter(i => i.assetType === 'preset')

	if (inspections.some(i => i.inspection === 'no_multiple_same_resources')) {
		let results = presets
			.map(i => no_multiple_different_quality_presets(i))

		inspections.push(...results)
	}

	let activePreset
	// for marking preset as installed
	if (presets.length === 1 && can_mark_as_active_preset(presets[0], inspections)) {
		activePreset = mark_as_active_preset(presets[0])

		inspections.push(activePreset)
	}

	if (activePreset) {
		let results = []
		//no_presets_without_recommended_addons()

		///if (result) inspections.push(...result)

	}

	inspections.push(newIspection({
		inspection: 'latest_version',
		type: 'notice-signal',
		version: ghResources[0].version,
	}))

	console.log(inspections)

	// computed .map, .filter etc. transforms
	// make inspections data-driven as possible for 'pure' ui (render data only, no transforms)
	const output = {
		latest_version: inspections.find(i => i.inspection === 'latest_version'),
	}

	return inspections
}

const no_old_versions = (i: customFolderResource, ghResources: customFolderResource[]) => {
	const latest = ghResources[0]
	const latestVersion = valid(latest.version)
	if (!latestVersion) throw 'version check err'

	if (i.assetType === 'preset') {
		const ourVersion = valid(i.version)
		if (!ourVersion) throw 'version err'

		const isOursOld = compare(latestVersion, ourVersion)
		if (isOursOld === 1) {
			console.log('old')

			return newIspection({
				inspection: 'no_old_versions',
				type: 'error',
				path: i.path,
				assetType: i.assetType,
			})
		}
	}

	return null
}

// case: multiple different quality presets installed. e.g low, low, high
const no_multiple_different_quality_presets = (i: customFolderResource) => {
	if (i.assetType !== 'preset') throw 'wrong resource type'

	return newIspection({
		inspection: 'no_multiple_different_quality_presets',
		type: 'error',
		path: i.path,
		assetType: i.assetType,
	})
}

// e.g: no more than 1 preset installed. low, high
const no_multiple_same_resources = (i: customFolderResource, all: customFolderResource[]) => {
	if (i.assetType !== 'preset') return null

	// name = high, autoexec
	const duplicates = all
		.filter(r => r.name === i.name)
		.length

	if (duplicates > 1) {
		return newIspection({
			inspection: 'no_multiple_same_resources',
			type: 'error',
			path: i.path,
			assetType: i.assetType,
		})
	}

	return null
}

const no_presets_without_recommended_addons = (i: customFolderResource) => {

}

// block marking as active preset
const blockingArr = ['no_multiple_same_resources']

const can_mark_as_active_preset = (i: customFolderResource, inspections: inspectionObj[]) => {
	if (i.assetType !== 'preset') throw 'wrong resource type'

	const hasBlocking = inspections.some(i => blockingArr.includes(i.inspection))

	if (hasBlocking) return false

	return true
}

// installed & active preset
const mark_as_active_preset = (i: customFolderResource) => {
	if (i.assetType !== 'preset') throw 'wrong resource type'

	return newIspection({
		inspection: 'active_preset',
		type: 'notice-signal',
		path: i.path,
		assetType: i.assetType,
	})
}

const no_autoexec_loops = (i: any) => {
	/exec autoexec/gmi.test(i.toString())
}