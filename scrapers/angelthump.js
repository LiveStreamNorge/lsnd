const axios = require("axios");

const platform = "angelthump";
module.exports = [platform, async function (username) {
    const {data} = await axios.get(`https://api.angelthump.com/v3/streams/?username=${username}`);
    const {data: userData} = await axios.get(`https://api.angelthump.com/v3/users/?username=${username}`);
    return {
        live: data?.[0]?.type === 'live',
        name: userData?.[0]?.display_name,
        broadcaster_type: userData?.[0]?.type,
        avatar: userData?.[0]?.profile_logo_url,
        username, platform,
        viewers: data?.[0]?.viewer_count,
        title: userData?.[0]?.title,
        thumbnail_url: data?.[0]?.thumbnail_url,
    };
}];
