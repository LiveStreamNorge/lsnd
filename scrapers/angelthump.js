const axios = require("axios");

const platform = "angelthump";
module.exports = [platform, async function (username) {
    const {data} = await axios.get(`https://api.angelthump.com/v3/streams/?username=${username}`);
    return {
        live: data.type === 'live',
        name: data.user?.display_name,
        broadcaster_type: '',
        avatar: data.user?.profile_logo_url,
        username, platform,
        viewers: data.viewer_count,
        title: data?.user.title,
        thumbnail_url: data?.thumbnail_url,
    };
}];
