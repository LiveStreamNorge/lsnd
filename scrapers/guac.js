const axios = require("axios");

const platform = "guac";
module.exports = [platform, async function (id) {
    const {data: _data} = await axios.get(`https://api.guac.tv/v2/stream/${id}`);
    if (_data?.data === null) return {};
    const data = _data.data;
    return {
        live: !!data.live,
        name: data?.user?.username,
        // Normalize broadcaster type (so that it's identical to Twitch)
        broadcaster_type: data.type && data.type !== 'NONE' ? data.type.toLowerCase() : '',
        avatar: data.user.avatar,
        id, platform,
        viewers: data.viewers,
        title: data.title,
        thumbnail_url: data?.banner,
    };
}];
