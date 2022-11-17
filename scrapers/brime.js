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

    const {data} = await axios.get(
    	`https://api.brime.tv/v1/channels/slug/${username}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
    );

    const {chatterData} = await axios.get(
        `https://api.brime.tv/v1/chat/channel/${username}/chatters`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }
    );

    return {
        live: data?.stream?.live,
        title: data?.stream?.title,
        viewers: chatterData?.count, 
        name: data?.display_name,
        avatar: `https://assets.brimecdn.com/cdn-cgi/image/width=80,quality=100/brime/users/${data?.owner?.xid}/avatar`,
        thumbnail_url: `https://thumbnails.brime.tv/cdn-cgi/image/width=640,quality=100,format=auto/live/${data?.owner?.xid}/thumbnail.jpg`,
    }
}];
