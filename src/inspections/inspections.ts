import {compare, valid} from 'semver'
import {assetType, customFolderResource} from '../CustomFolderResources/CustomFolderResources'

export type inspectionObj = {
	inspection: string
	path: string
	assetType: assetType
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

	inspections.push({
		inspection: 'latest_version',
		version: ghResources[0].version,
	})

	console.log(inspections)

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

			return {
				inspection: 'no_old_versions',
				path: i.path,
				assetType: i.assetType,
			} as inspectionObj
		}
	}

	return null
}

// case: multiple different quality presets installed. e.g low, low, high
const no_multiple_different_quality_presets = (i: customFolderResource) => {
	if (i.assetType !== 'preset') throw 'wrong resource type'

	return {
		inspection: 'no_multiple_different_quality_presets',
		path: i.path,
		assetType: i.assetType,
	} as inspectionObj
}

// e.g: no more than 1 preset installed. low, high
const no_multiple_same_resources = (i: customFolderResource, all: customFolderResource[]) => {
	if (i.assetType !== 'preset') return null

	// name = high, autoexec
	const duplicates = all
		.filter(r => r.name === i.name)
		.length

	if (duplicates > 1) {
		return {
			inspection: 'no_multiple_same_resources',
			path: i.path,
			assetType: i.assetType,
		} as inspectionObj
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

	return {
		inspection: 'active_preset',
		path: i.path,
		assetType: i.assetType,
	} as inspectionObj
}

const no_autoexec_loops = (i: any) => {
	/exec autoexec/gmi.test(i.toString())
}