const axios = require("axios");
const nconf = require('nconf');
const assert = require("assert");

nconf.argv()
    .env()
    .file({
        file: 'config.json'
    }
);

module.exports = ["brime", async function (username) {
    // TODO: Take a more functional approach and wrap the entire
    //       lambda instead of accessing it directly?
    const token = nconf.get('brime:client_id');
    if(!token) throw new Error("No brime:client_id set.");

    const {data} = await axios.get(
    	`https://api-staging.brimelive.com/v1/stream/${username}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Client-ID': token,
            }
        }
    );

    return {
        live: data.isLive,
        title: data.title,
        viewers: data.viewerCount, // this is not yet returned from API
        name: data.channel,
        avatar: data?.broadcastingUser?.avatar,
        thumbnail_url: data?.streamThumbnailUrl
    }
}];
