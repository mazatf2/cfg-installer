import {request} from '@octokit/request'
import {OctokitResponse, ReposListReleasesResponseData} from '@octokit/types'
import {fetch} from 'cross-fetch'

export const fetchGitHubReleases = async () => {
	return new Promise<OctokitResponse<ReposListReleasesResponseData>>(async (resolve, reject) => {

		const res = await request('GET /repos/:owner/:repo/releases', {
			owner: 'mastercomfig',
			repo: 'mastercomfig',
		}).catch(err => reject(err))

		if (res && res?.status === 200) {
			if (res.data.length > 30) {
				res.data = res.data.splice(0, 30)
			}
			resolve(res)
		} else {
			reject(res)
		}

	})
}

export const fetchGithub = (url: string) => {
	return new Promise(async (resolve, reject) => {
		const res = await fetch(url)
			.catch(err => reject(err))

		if (res && res.status === 200) {
			resolve(res)
		} else {
			reject(res)
		}
	})
}