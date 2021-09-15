const axios = require("axios");

const TikTokScraper = require('tiktok-scraper');

const Agent = require('secret-agent');

const CONST = require('tiktok-scraper/build/constant');

const platform = "tiktok";
const options = {};
process.env.SA_SHOW_BROWSER="1" ;

async function fetchRoomInfo(roomId) {
	var fetchUrl1 = "https://webcast.tiktok.com/webcast/room/info/?channel=web&aid=1988&app_language=en&webcast_language=en&app_name=tiktok_web&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=en-US&browser_platform=Win32&browser_name=Mozilla&browser_version=5.0%20%28Windows%29&browser_online=true&tz_name=Asia%2FShanghai&room_id="
	var fetchUrl2 = "&is_anchor=false&msToken=&X-Bogus=DFSzsIVOAg2ANaAwSYROKzyxgzR4&_signature=_02B4Z6wo000012DfGXQAAIDDYnjw3eCHAWtg3h3AALkQa9"
	var fetchUrl = fetchUrl1 + roomId + fetchUrl2
	const {data} = await axios(fetchUrl,
		{
			withCredentials: true,
			"headers": {
				"User-Agent": CONST.userAgent(),
				"Accept": "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.5",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-site",
				"referrer": "https://www.tiktok.com/",
			},
			"method": "GET",
			"mode": "cors"
		});
	console.log(data);
	return data;
}

let tiktok_room_id = (username) => new Promise(async (resolve, reject) => {
	/*try {
		const user = await TikTokScraper.getUserProfileInfo(username, options);
		console.log('tiktok_room_id', user);
		resolve(user?.roomId);
	} catch(e) {
		reject(e);
	}*/
	const agent = await new Agent.Agent({
		userAgent: CONST.userAgent(),
		showReplay: true,
		blockedResourceTypes: ['All'],
	});
	try {
		await agent.goto(`https://www.tiktok.com/@${username}`);
		console.log(agent, agent.document);
		const dataJson = await agent.document.querySelector('#__NEXT_DATA__').textContent;
		console.log(dataJson);
		await agent.close();
		const data = JSON.parse(dataJson);
		console.log(data);
		console.log({
			roomId: data?.props?.pageProps?.roomId,
			avatar: data?.props.pageProps?.userInfo?.user?.avatarLarger
		});
		resolve(data?.props?.pageProps?.roomId);
	} catch (e) {
		reject(e);
	}
});

module.exports = [platform, async function (username) {
	const roomId = await tiktok_room_id(username);
	if (!roomId) return {};
	const data = await fetchRoomInfo(roomId);
	if (!data) return {name: username};
	return {
		// status 2 = live, status 4 = ended
		// live: data.status === 4 && !data.is_replay,
		live: data.live_type_audio || data.live_type_linkmic || data.live_type_normal || data.live_type_sandbox || data.live_type_screenshot || data.live_type_social_live || data.live_type_third_party,
		name: data?.owner?.display_id,
		avatar: data?.owner?.avatar_large.url_list[1],
		thumbnail_url: data?.covers?.url_list[1],
		id, platform,
		viewers: data.user_count,
		title: data.title,
	};
}];
