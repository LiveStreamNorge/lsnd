const http = require('http');

const https = require('https');
const fs = require('fs');

const nconf = require('nconf');

const express = require('express');
const cors = require('cors');

const crypto = require('crypto');

const scrapers = require("./scrapers");

nconf.argv()
    .env()
    .file({
        file: 'config.json'
    }
);

nconf.set('http:port', '9080');
nconf.set('http:ssl', false);
nconf.set('http:ssl_port', '9443');

nconf.set('http:ssl_cert', '');
nconf.set('http:ssl_privkey', '');
nconf.save();

const port = nconf.get('http:port') || 80;
const sslPort = nconf.get('http:ssl_port') || 443;
const app = express();

const idToData = new Map();

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50 // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(limiter);

app.get('/streams', async (req, res) => {
    let data = Array.from(idToData.values());
    console.log(req.query.filter);
    if(req.query.filter && typeof req.query.filter === 'object'){
        let filteredData = data;
        Object.entries(req.query.filter).forEach(arg => {
            const index = arg[0];
            const filter = arg[1];
            console.log(arg, index, filter);
            filteredData = filteredData.filter(d => {
                if(filter === 'true') filter = true;
                if(filter === 'false') filter = false;
                return d[index] === filter;
            })
        })
        res.send(filteredData);
    }else{
        res.send(data);
    }
    console.info(`[${req.ip}] Requested /streams`);
})

app.get('/src', (req, res) => {
    res.send(`Copyright ${new Date().getFullYear()}, AGPLv3, https://github.com/LiveStreamNorge/lsnd`)
});

const updatePeriod = 5 * 60 * 1000;

/**
 * @return Boolean
 * @returns Return true on successful scrape
 */
async function scrape({platform, userId, customUsername, ...rest}) {
    let data;

    const scraper = (scrapers.has(platform) && scrapers.get(platform))
        || ( async () => { throw new Error(`Platform ${platform} not supported!`); } );

    try {
        data = await scraper(userId, customUsername);
    } catch (e) {
        console.error(`Couldn't scrape ${userId} ${customUsername ?? ""}: `, e.message);
        return false;
    }

    const id = crypto.createHash('sha256').update(platform + userId + customUsername).digest('hex');
    // Append `id' and `userId' fields before adding to the map
    data = { id, userId, ...data };
    if(rest.featuredRank) data.featuredRank = rest.featuredRank;
    if(rest.team) data.team = rest.team;

    idToData.set(id, data);

    return true;
}

const timestamp = () => new Date().toTimeString().split(' ')[0];
const loadPeople = async people => {
    console.info("Populating scrape data...");

    // multithread all initial scrapes, wait for them all to finish
    await Promise.all(
        people.map(async (person, i) => {
            setTimeout(() => {
                setInterval(async () => {

                    await scrape(person);
                    console.info(
                        `[${timestamp()}] Rescraped ${(person.userId)}`
                    );

                }, updatePeriod);
            }, (updatePeriod / people.length) * i);
            // Split `updatePeriod` into equal periods, and then scrape every `updatePeriod`,
            // so that the scrapes are evenly distributed over the `updatePeriod`.

            await scrape(person) && console.info(`Scraped ${(person.userId)}!`);
        })
    );

    console.info("Finished scraping everyone!")
}

const people = require('./people.json');

const httpServer = http.createServer(app);
httpServer.listen(port, async () => {
    console.log(`lsnd listening to 0.0.0.0:${port}`);
    await loadPeople(people);
});

// Try setting up an https server
if(nconf.get('http:ssl') === true){
    try {
        const key = fs.readFileSync(nconf.get('http:ssl_privkey') || '/etc/certs/api.jdanks.army/privkey.pem');
        const cert = fs.readFileSync(nconf.get('http:ssl_cert') || '/etc/certs/api.jdanks.army/fullchain.pem');
        const httpsServer = https.createServer({key, cert}, app);
        httpsServer.listen(443, () => {
            console.log(`lsnd/TLS listening to 0.0.0.0:${sslPort}`);
        });
    } catch (e) {
        console.error("Couldn't set up HTTPS server!");
        console.error(e.message);
    }
}