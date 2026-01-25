import puppeteer from "puppeteer";
import { Util } from "../utils/util";

const url = process.argv[2];
const util = new Util();

let artistName: string;
let albumName: string;

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

    await page.waitForSelector("ytmusic-thumbnail-renderer.thumbnail:nth-child(3) > yt-img-shadow:nth-child(1) > img:nth-child(1)", { visible: true });
    artistName = await page.evaluate(() => document.querySelector(".strapline-text > a:nth-child(1)")?.textContent) || "";
    albumName = await page.evaluate(() => document.querySelector("h1.style-scope:nth-child(6) > yt-formatted-string:nth-child(1)")?.textContent) || "";
    info = { artistName, albumName };

    console.log(JSON.stringify(info));
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    browser.close();
  }
};

getInfo();
