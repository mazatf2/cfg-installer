import {valid, compare} from 'semver'
import {customFolderResource} from '../../tools/generate_config'

export type inspectionObj = {
	inspection: string
	path: string
}

export const Inspections = (customFolderResources: customFolderResource[] | null, ghResources:  customFolderResource[] | null) => {
	const inspections: inspectionObj[] = []

	if(!customFolderResources || !ghResources) {
		console.error('!filesystemAssets')
		return inspections
	}

	for (const i of customFolderResources) {
		const result = no_old_versions(i, ghResources)

		if (result?.inspection) inspections.push(result)
	}

	return inspections
}

const no_old_versions = (i: customFolderResource, ghResources: customFolderResource[]) => {
	const latest = ghResources[0]
	const latestVersion = valid(latest.version)
	if (!latestVersion) return 'version check err'

	if (i.assetType === 'preset') {
		const ourVersion = valid(i.version)
		if (!ourVersion) return 'version err'

		const isOursOld = compare(latestVersion, ourVersion)
		if (isOursOld === 1) {
			console.log('old')
			return {
				inspection: 'no_old_versions',
				path: i.path,
			} as inspectionObj
		}
	}
}

// etc: no more than 1 preset installed. low, high
const no_multiple_same_resources = (i: customFolderResource, ghResources: customFolderResource[]) => {

}

const no_autoexec_loops = (i: any) => {
	/exec autoexec/gmi.test(i.toString())
}