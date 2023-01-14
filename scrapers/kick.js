const Hero = require("@ulixee/hero-playground");

const platform = "kick";
module.exports = [
  platform,
  async function (username) {
    const hero = new Hero();
    await hero.goto(`https://kick.com`, {
      timeoutMs: 3000,
    });
    const response = await hero.fetch(
      `https://kick.com/api/v1/channels/${username}`,
      {
        method: "GET",
      }
    );
    let data = {};
    if (await response.ok) {
      data = await response.json();
    }

    await hero.close();

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
