import puppeteer from "puppeteer";
import { Util } from "../utils/util";

const url = process.argv[2];
const util = new Util();

let total: string;

const getInfo = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.setUserAgent(util.generateRandomUA());
  let info;

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    if (url.includes("weebcentral")) {

      await page.waitForSelector("a.hover\\:bg-base-300:nth-child(1) > span:nth-child(2) > span:nth-child(1)", { visible: true });
      total = await page.evaluate(() => document.querySelector("a.hover\\:bg-base-300:nth-child(1) > span:nth-child(2) > span:nth-child(1)")?.textContent) || "";
      total = total.split(" ")[1];
      info = { total };

    } else if (url.includes("mangadex")) {

      await page.waitForSelector("div.rounded-sm:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > a:nth-child(1) > span:nth-child(2) > span:nth-child(1)", { visible: true });
      total = await page.evaluate(() => document.querySelector("div.rounded-sm:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > a:nth-child(1) > span:nth-child(2) > span:nth-child(1)")?.textContent) || "";
      total = total.match(/\d+(\.\d+)*/g)?.toString() || "";
      info = { total };

    } else if (url.includes("webtoons")) {

      total = await page.evaluate(() => document.querySelector("#_listUl > li:nth-child(1) > a > span.subj > span")?.textContent) || "";
      total = total.match(/\b(\d+)\b/)?.shift() || "";
      info = { total };

    } else if (url.includes("archiveofourown")) {

      total = await page.evaluate(() => document.querySelector("dd.chapters")?.textContent?.split("/")[1]) || "";;
      info = { total };

    } else if (url.includes("anilist")) {

      const domain = "Anlist"
      total = await util.getDivBelow("Episodes", page, domain);
      info = { total };

    } else if (url.includes("themoviedb")) {

      let lastSeason = await page.evaluate(() => document.querySelector("section.panel.season > div.season.card > div > div.content > div > h2 > a")?.textContent) || "";
      let lastEpisode = await page.evaluate(() => document.querySelector("section.panel.season > div.season.card > div > div.content > div > div.flex.rating_wrapper > h4")?.textContent) || "";
      total = `S${lastSeason?.replace(/\D/g, "")}.E${lastEpisode.split("•")[1]?.split(" ")[1]}`;
      info = { total };

    } else if (url.includes("imdb")) {

      total = await page.evaluate(() => document.querySelector("div.ipc-list-card--hasActions:nth-child(1) > div:nth-child(1) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)")?.textContent) || "";
      info = { total };

    }

    console.log(JSON.stringify(info));
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    browser.close();
  }
};

getInfo();
