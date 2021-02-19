const axios = require("axios");

const platform = "guac";
module.exports = [platform, async function (id) {
    const {data: _data} = await axios.get(`https://api.guac.live/watch/${id}`);
    if (_data?.statusCode !== 200) return {};
    const data = _data.data;
    return {
        live: data.live,
        name: data.name,
        avatar: data.user.avatar,
        id, platform,
        viewers: data.viewers,
        title: data.title,
    };
}];
