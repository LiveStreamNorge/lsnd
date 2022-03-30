const axios = require("axios");

const platform = "tiktok";

const CONST = require('tiktok-scraper/build/constant');
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
	return data.data;
}

let tiktok_room_info = async (username) => {
	var fetchUrl1 = "https://m.tiktok.com/node/share/user/@"
	var fetchUrl = fetchUrl1 + username;
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
	return data;
};

module.exports = [platform, async function (username) {
	const {userInfo} = await tiktok_room_info(username);
	const {roomId, avatarThumb: avatar} = userInfo.user;
	if (!roomId) return {name: username, avatar, live: false};
	const data = await fetchRoomInfo(roomId);
	if (!data) return {name: username, avatar, live: false};
	return {
		// status 2 = live, status 4 = ended
		// live: data.status === 4 && !data.is_replay,
		live: data.live_type_audio || data.live_type_linkmic || data.live_type_normal || data.live_type_sandbox || data.live_type_screenshot || data.live_type_social_live || data.live_type_third_party,
		name: data?.owner?.display_id,
		avatar: data?.owner?.avatar_large.url_list[1],
		thumbnail_url: data?.cover?.url_list[1],
		platform,
		viewers: data.user_count,
		title: data.title,
	};
}];
