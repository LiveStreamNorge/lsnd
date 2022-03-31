# lsnd
[Orginally forked from jdanks.armyd](https://github.com/jdanks-army/jdanks.armyd).

The `lsn` daemon, based on jdanks.armyd.
Used for a directory of Norwegian streamers on [LiveStreamNorge](https://livestreamnorge.no)

Run `npm ci && npm start` to get it going.


Reads input from `./people.json` and starts scrapin'.

`people` JSON format:
```
[
  [platform, id, ...optional]
]
```

### Supported platforms:
 - `"youtube"` - id has to be the long `UC.....` format
 - `"dlive"`
 - `"bitwave"`
 - `"robotstreamer"` - third entry is used as username
 - `"trovo"` - expects `TROVO_CLIENT_ID` envar
 - `"twitch"` - expects `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` envars
 - `"guac"`
 - `"tiktok"`
 - `"angelthump"`

### Config file
A config file (config.json) is loaded using nconf.
All secrets are optional; in that case, scraping from these 
websites will not function.

```
{
  "http": {
    "port": "9080",
    "ssl": false,
    "ssl_port": "9443",
    "ssl_cert": "",
    "ssl_privkey": ""
  },
  "twitch": {
    "client_id": "",
    "client_secret": ""
  },
  "trovo": {
    "client_id": ""
  }
}
```


### Endpoints
Exposed endpoints are 
 - `/streams` · returns JSON objects of scraped data, formatted as:
      - ```
        {
          platform,
          id,
          name,
          avatar,
          live,
          title,
          viewers
        }
        ```
 - `/platforms` · returns a JSON object of supported platforms
 - `/src` · returns license information and link to source code
