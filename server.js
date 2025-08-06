/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const puppeteer = require('puppeteer');

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };

  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];

    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo,
    };
  }

  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view("/src/pages/index.hbs", params);
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/", function (request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  // If the user submitted a color through the form it'll be passed here in the request body
  let color = request.body.color;

  // If it's not empty, let's try to find the color
  if (color) {
    // ADD CODE FROM TODO HERE TO SAVE SUBMITTED FAVORITES

    // Load our color data file
    const colors = require("./src/colors.json");

    // Take our form submission, remove whitespace, and convert to lowercase
    color = color.toLowerCase().replace(/\s/g, "");

    // Now we see if that color is a key in our colors object
    if (colors[color]) {
      // Found one!
      params = {
        color: colors[color],
        colorError: null,
        seo: seo,
      };
    } else {
      // No luck! Return the user value as the error property
      params = {
        colorError: request.body.color,
        seo: seo,
      };
    }
  }

  // The Handlebars template will use the parameter values to update the page with the chosen color
  return reply.view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);

fastify.post("/scrape", async (request, reply) => {
  const deckCode = request.body.url;
  const url = `https://www.pokemon-card.com/deck/deck.html?deckID=${deckCode}`;

  if (!deckCode) {
    return reply.status(400).send({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // DOMが完全に読み込まれるまで待機
    await page.waitForSelector("#cardImagesView");

    // JavaScript実行後のDOMを取得
    const bodyHTML = await page.evaluate(() => {
      const baseUrl = document.baseURI; // 現在のページのベースURL
      const container = document.querySelector("#cardImagesView");

      // imgタグのsrcを絶対URLに変換
      container.querySelectorAll("img").forEach(img => {
        if (img.src.startsWith("/")) {
          img.src = new URL(img.src, baseUrl).href;
        }
      });

      return container.innerHTML;
    });

    await browser.close();
    return reply.send({ body: bodyHTML });
  } catch (error) {
    console.error("Error:", error);
    return reply.status(500).send({ error: "An error occurred during scraping" });
  }
});

fastify.post("/scrapes", async (request, reply) => {
  const deckCode = request.body.url; // POSTリクエストのボディからURLを取得
  const url = `https://www.pokemon-card.com/deck/deck.html?deckID=${deckCode}`;

  if (!deckCode) {
    return reply.status(400).send({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("OK1");
    const bodyHTML = await page.evaluate(() => {
      return document.querySelector("#cardImagesView").innerHTML;
    });

    await browser.close();

    console.log("OK4");
    return reply.send({ body: bodyHTML }); // スクレイピング結果を返す
  } catch (error) {
    console.error("Error:", error);
    return reply.status(500).send({ error: "An error occurred during scraping" });
  }
});



