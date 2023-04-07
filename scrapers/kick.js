const axios = require("axios");
const platform = "kick";
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);
module.exports = [
  platform,
  async function (username) {
    const { data } = await axios.get(
      `https://${platform}.com/api/v2/channels/${username}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": `${capitalize(
            platform
          )}/1.0.13 Dalvik/2.1.0 (Linux; U; Android 13; Pixel 6 Pro Build/TQ1A.221205.011)`,
        },
      }
    );

    if (!data) {
      return {
        name: username,
        avatar,
        live: false,
        title: null,
        platform,
        viewers: null,
        thumbnail_url: null,
      };
    }

    return {
      live: data?.livestream && data?.livestream?.is_live ? true : false,
      name: data?.user?.username,
      broadcaster_type: data?.verified ? "PARTNER" : "",
      avatar: data?.user?.profile_pic,
      username,
      platform,
      viewers: data?.livestream?.viewers,
      title: data?.livestream?.session_title, // or session_description
      thumbnail_url: data?.livestream?.thumbnail?.url,
    };
  },
];
