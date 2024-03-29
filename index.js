const http = require("http");

const https = require("https");
const fs = require("fs");

const nconf = require("nconf");

const express = require("express");
const cors = require("cors");

const crypto = require("crypto");

const scrapers = require("./scrapers");

nconf.argv().env().file({
  file: "config.json",
});

nconf.set("http:port", "9080");
nconf.set("http:ssl", false);
nconf.set("http:ssl_port", "9443");

nconf.set("http:ssl_cert", "");
nconf.set("http:ssl_privkey", "");
nconf.save();

const port = nconf.get("http:port") || 80;
const sslPort = nconf.get("http:ssl_port") || 443;
const app = express();

const idToData = new Map();

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(limiter);

app.get("/", (req, res) => {
  res.send("LiveStreamNorge API");
});
app.get("/streams", async (req, res) => {
  let data = Array.from(idToData.values());
  if (req.query.filter && typeof req.query.filter === "object") {
    let filteredData = data;
    Object.entries(req.query.filter).forEach((arg) => {
      var index = arg[0];
      var filter = arg[1];
      filteredData = filteredData.filter((d) => {
        if (filter === "true") filter = true;
        if (filter === "false") filter = false;
        if (filter && typeof filter === "string" && filter.indexOf(",") > -1) {
          filters = filter.split(",");
          for (f in filters) {
            if (filters.hasOwnProperty(f)) {
              if (d[index] === filters[f]) return true;
            }
          }
          return false;
        } else {
          return d[index] === filter;
        }
      });
    });
    res.send(filteredData);
  } else {
    res.send(data);
  }
  console.info(`[${req.ip}] Requested /streams`);
});

app.get("/teams", (req, res) => {
  let data = Array.from(idToData.values());
  let teams = [];
  data.forEach((d) => {
    if (d.team && teams.indexOf(d.team) === -1) teams.push(d.team);
  });
  res.send(teams);
});

app.get("/platforms", (req, res) => {
  res.send([...scrapers]?.map((s) => s[0]) ?? {});
});

app.get("/src", (req, res) => {
  res.send(
    `Copyright ${new Date().getFullYear()}, AGPLv3, https://github.com/LiveStreamNorge/lsnd`
  );
});

const updatePeriod = 5 * 60 * 1000; // 5 minutes

/**
 * @return Boolean
 * @returns Return true on successful scrape
 */
async function scrape({ platform, userId, customUsername, ...rest }) {
  let data;

  const scraper =
    (scrapers.has(platform) && scrapers.get(platform)) ||
    (async () => {
      throw new Error(`Platform ${platform} not supported!`);
    });
  const id = crypto
    .createHash("sha256")
    .update(platform + userId + customUsername)
    .digest("hex");

  if (platform === "kick") {
    // wait 2 sec before fetching
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  try {
    data = await scraper(userId, customUsername);
  } catch (e) {
    console.error(
      `Couldn't scrape ${userId} ${customUsername ?? ""}: `,
      e.message
    );
    // Add a placeholder user (in case the first API request for this user fails)
    if (!idToData.get(id)) {
      idToData.set(id, {
        id,
        userId,
        platform,
        name: customUsername ?? userId,
        customUsername,
        featuredRank: rest.featuredRank ?? null,
        team: rest.team ?? null,
      });
    }
    return false;
  }

  // Append `id' and `userId' fields before adding to the map
  data = { id, userId, ...data };
  if (rest.featuredRank) data.featuredRank = rest.featuredRank;
  if (rest.team) data.team = rest.team;

  idToData.set(id, data);

  return true;
}

const timestamp = () => new Date().toTimeString().split(" ")[0];
const loadPeople = async (people) => {
  console.info("Populating scrape data...");

  // multithread all initial scrapes, wait for them all to finish
  await Promise.all(
    people.map(async (person, i) => {
      setTimeout(() => {
        setInterval(async () => {
          await scrape(person);
          console.info(`[${timestamp()}] Rescraped ${person.userId}`);
        }, updatePeriod);
      }, (updatePeriod / people.length) * i);
      // Split `updatePeriod` into equal periods, and then scrape every `updatePeriod`,
      // so that the scrapes are evenly distributed over the `updatePeriod`.

      (await scrape(person)) && console.info(`Scraped ${person.userId}!`);
    })
  );

  console.info("Finished scraping everyone!");
};

const people = require("./people.json");

const httpServer = http.createServer(app);
httpServer.listen(port, async () => {
  console.log(`lsnd listening to 0.0.0.0:${port}`);
  await loadPeople(people);
});

// Try setting up an https server
if (nconf.get("http:ssl") === true) {
  try {
    const key = fs.readFileSync(
      nconf.get("http:ssl_privkey") ||
        "/etc/certs/lsn-api.dat.cloud/privkey.pem"
    );
    const cert = fs.readFileSync(
      nconf.get("http:ssl_cert") || "/etc/certs/lsn-api.dat.cloud/fullchain.pem"
    );
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(443, () => {
      console.log(`lsnd/TLS listening to 0.0.0.0:${sslPort}`);
    });
  } catch (e) {
    console.error("Couldn't set up HTTPS server!");
    console.error(e.message);
  }
}
