const axios = require("axios");

const platform = "angelthump";
module.exports = [platform, async function (username) {
    const {data} = await axios.get(`https://api.angelthump.com/v3/streams/?username=${username}`);
    const {data: userData} = await axios.get(`https://api.angelthump.com/v3/users/?username=${username}`);
    return {
        live: data.type === 'live',
        name: userData?.display_name,
        broadcaster_type: userData?.type,
        avatar: userData?.profile_logo_url,
        username, platform,
        viewers: data.viewer_count,
        title: userData.title,
        thumbnail_url: data?.thumbnail_url,
    };
}];
