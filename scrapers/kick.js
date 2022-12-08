const axios = require("axios");

const platform = "kick";
module.exports = [platform, async function (username) {
	const {data} = await axios.get(`https://kick.com/api/v1/channels/${username}`);
	return {
		live: data?.livestream?.is_live,
		name: data?.name,
		broadcaster_type: data?.role, // TODO
		avatar: data?.user?.profile_pic,
		username, platform,
		viewers: data?.livestream?.viewers,
		title: data?.livestream?.session_title, // or session_description
		thumbnail_url: data?.livestream?.thumbnail?.url,
	};
}];
