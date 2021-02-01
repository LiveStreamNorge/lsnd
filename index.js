const http = require('http');

const https = require('https');
const fs = require('fs');

const express = require('express');
const cors = require('cors');

const crypto = require('crypto');

const scrapers = require("./scrapers");

const port = process.env.JDANKS_PORT || 80;
const sslPort = process.env.JDANKS_SSL_PORT || 443;
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
    console.info(`[${req.ip}] Requested /streams`);
    res.send(Array.from(idToData.values()));
})

app.get('/src', (req, res) => {
    res.send(`Copyright ${new Date().getFullYear()}, AGPLv3, https://github.com/jdanks-army/jdanks.armyd`)
});

const updatePeriod = 5 * 60 * 1000;

/**
 * @return {Promise<void>}
 * @returns Will never error; always resolves
 */
async function scrape({platform, userId, customUsername}) {
    let data;

    if (!scrapers.has(platform))
        return console.error(`Platform ${platform} not supported (${userId})!`);

    try {
        data = await scrapers.get(platform)(userId, customUsername);
    } catch (e) {
        console.error(`Couldn't scrape ${userId} ${customUsername ?? ""}: `, e.message);
    }

    const id = crypto.createHash('sha256').update(platform + userId + customUsername).digest('hex');
    data && (data.id = id) && (data.userId = userId) && idToData.set(id, data);
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

            await scrape(person); console.info(`Scraped ${(person.userId)}!`);
        })
    );

    console.info("Finished scraping everyone!")
}

const people = require('./people.json');

const httpServer = http.createServer(app);
httpServer.listen(port, async () => {
    console.log(`jdanks.armyd listening to 0.0.0.0:${port}`);
    await loadPeople(people);
});

// Try setting up an https server
try {
    const key = fs.readFileSync(process.env.JDANKS_SSL_PRIVKEY || '/etc/certs/api.jdanks.army/privkey.pem');
    const cert = fs.readFileSync(process.env.JDANKS_SSL_CERT || '/etc/certs/api.jdanks.army/fullchain.pem');
    const httpsServer = https.createServer({key, cert}, app);
    httpsServer.listen(443, () => {
        console.log(`jdanks.armyd/TLS listening to 0.0.0.0:${sslPort}`);
    });
} catch (e) {
    console.error("Couldn't set up HTTPS server!");
    console.error(e.message);
}
