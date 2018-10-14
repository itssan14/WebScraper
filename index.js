const puppeteer = require("puppeteer");
const fs = require("fs");

// Launch puppeteer
(async () => {
  const extractPartners = async url => {
    const page = await browser.newPage();
    await page.goto(url);

    // Set screensize and take screenshot of the page
    await page.setViewport({ width: 1000, height: 3500 });
    await page.screenshot({ path: "init.png" });

    // Obtain title and logo from page of all partners
    const pop = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.compact")).map(partner => ({
        title: partner.querySelector("h3.title").innerText.trim(),
        logo: partner.querySelector(".logo img").src
      }))
    );
    await page.close();

    // Recursively check all pages of the website
    if (pop.length < 1) {
      // if a page has no partners stop and return partners list
      return pop;
    } else {
      // Traverse recursively to next ?page=/d+/
      const pageno = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      const nurl = `https://marketingplatform.google.com/about/partners/find-a-partner?page=${pageno}`;
      return pop.concat(await extractPartners(nurl));
    }
  };

  const browser = await puppeteer.launch();
  const url = `https://marketingplatform.google.com/about/partners/find-a-partner?page=40`;
  const partners = await extractPartners(url);

  //Write list of partners to json file
  await fs.writeFile("data.json", JSON.stringify(partners), err => {
    if (err) throw err;
  });

  // Close puppeteer instance
  await browser.close();
})();
