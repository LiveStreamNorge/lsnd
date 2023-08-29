const platform = "kick";
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);
const initCycleTLS = require("cycletls");

let xsrfToken = null;

// get xsrf token from cookie
async function fetchXSFRToken() {
  // Initiate CycleTLS
  const cycleTLS = await initCycleTLS();

  const request = await cycleTLS.head(`https://${platform}.com`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `${capitalize(
        platform
      )}/1.0.13 Dalvik/2.1.0 (Linux; U; Android 13; Pixel 6 Pro Build/TQ1A.221205.011)`,
    },
    ja3: "771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28-21,29-23-24-25-256-257,0",
    method: "GET",
  });
  const cookies = request.headers["Set-Cookie"].join(";");
  if (!cookies) {
    console.error("No cookies");
    return false;
  }
  const xsrfCookie = cookies
    .split(";")
    .find((cookie) => cookie.includes("XSRF-TOKEN"));
  if (!xsrfCookie) {
    console.error("No XSRF-TOKEN cookie");
    return false;
  }
  xsrfToken = xsrfCookie.split("=")[1];
  return true;
}

fetchXSFRToken();

module.exports = [
  platform,
  async function (username) {
    // Initiate CycleTLS
    const cycleTLS = await initCycleTLS();
    const res = await cycleTLS.get(
      `https://${platform}.com/api/v2/channels/${username}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": `${capitalize(
            platform
          )}/1.0.13 Dalvik/2.1.0 (Linux; U; Android 13; Pixel 6 Pro Build/TQ1A.221205.011)`,
        },
        Cookies: [
          {
            name: "XSRF-TOKEN",
            value: xsrfToken,
            domain: "kick.com",
            path: "/",
            secure: true,
            httpOnly: true,
          },
        ],
        ja3: "771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28-21,29-23-24-25-256-257,0",
      }
    );
    const data = res?.body;

    await cycleTLS.exit();
    if (!data) {
      return {
        name: username,
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
      broadcaster_type: data?.verified
        ? "PARTNER"
        : data?.subscription_enabled
        ? "affiliate"
        : "",
      avatar: data?.user?.profile_pic,
      username,
      platform,
      viewers: data?.livestream?.viewer_count,
      title: data?.livestream?.session_title, // or session_description
      thumbnail_url: data?.livestream?.thumbnail?.url,
    };
  },
];
