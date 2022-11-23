const axios = require("axios");

const platform = "kick";
module.exports = [platform, async function (username) {
	const {data} = await axios.get(`https://kick.com/api/v1/channels/${username}`);
	const {data: viewerData} = await axios.get(`https://api.kick.com/api/livestreams/${data?.livestream?.id}/viewers_count/${data?.livestream?.categories?.id}`);
	const viewerCount = viewerData?.livestreams?.find((stream) => stream.id === data?.livestream?.id?.toString())?.viewers_count;
	return {
		live: data?.livestream?.is_live,
		name: data?.name,
		broadcaster_type: data?.role, // TODO
		avatar: data?.user?.profile_pic,
		username, platform,
		viewers: viewerCount,
		title: data?.livestream?.session_title, // or session_description
		thumbnail_url: data?.livestream?.thumbnail?.url,
	};
}];
