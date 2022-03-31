const axios = require("axios");
const {WebcastPushConnection} = require('tiktok-livestream-chat-connector');

const platform = "tiktok";

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
	let tiktokChatConnection = new WebcastPushConnection('@' + username);

	let data = false;
	try {
		data = await tiktokChatConnection.getRoomInfo();
	} catch (err) {
		data = false;
	}
	if (!data) {
		return {
			name: username, avatar, live: false,
			title: null,
			platform,
			viewers: null,
			thumbnail_url: null
		};
	}
	console.log('tiktok debug: ', data);
	return {
		// status 2 = live, status 4 = ended
		live: data.status === 2,
		// live: data.live_type_audio || data.live_type_linkmic || data.live_type_normal || data.live_type_sandbox || data.live_type_screenshot || data.live_type_social_live || data.live_type_third_party,
		name: data?.owner?.display_id,
		avatar: data?.owner?.avatar_large.url_list[1],
		thumbnail_url: data?.cover?.url_list[1],
		platform,
		viewers: data.user_count,
		title: data.title,
	};
}];
