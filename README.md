# jdanks.armyd
[Orginally forked from jdanks.armyd](https://github.com/jdanks-army/jdanks.armyd)
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

### Environment variables
All secrets are optional; in that case, scraping from these 
websites will not function.

- `LSN_PORT` · Listen port. Defaults to `80`.
- `LSN_SSL_PORT` · Listen port for HTTPS. Defaults to `443`.
- `LSN_SSL_PRIVKEY` · Location of private key. Defaults to `/etc/certs/api.jdanks.army/privkey.pem`.
- `LSN_SSL_CERT` · Listen of certificate. Defaults to `/etc/certs/api.jdanks.army/fullchain.pem`.
 - `TROVO_CLIENT_ID` · for Trovo support.
 - `TWITCH_CLIENT_ID` `TWITCH_CLIENT_SECRET` · for Twitch support.


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
 - `/src` · returns license information and link to source code
