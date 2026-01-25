import puppeteer from "puppeteer";
import { Util } from "./utils/util";

const url = process.argv[2];
const isBatch = process.argv[3] == 'true';
const util = new Util();

interface Album {
  name: string,
  url: string,
  year: string,
  type: string,
}

let artistName: string;
let albumName: string;
let albumYear: string;
let albums: Album[];

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

    if (isBatch) {
      await page.waitForSelector("#items > ytmusic-two-row-item-renderer:nth-child(1)", { visible: true, timeout: 10000 });
      artistName = await page.evaluate(() => document.querySelector("yt-formatted-string.ytmusic-header-renderer")?.textContent) || "";
      albums = await page.$$eval("#items ytmusic-two-row-item-renderer", (elements) => {
        return elements.map((element) => {
          const titleElement = element.querySelector("yt-formatted-string.title");
          const linkElement = element.querySelector("a");
          const yearElement = element.querySelector("div:nth-child(4) > span:nth-child(2) > yt-formatted-string:nth-child(2) > span:nth-child(3)");
          const typeElement = element.querySelector("div:nth-child(4) > span:nth-child(2) > yt-formatted-string:nth-child(2) > span:nth-child(1)");

          return {
            name: titleElement?.textContent?.trim() || "",
            url: linkElement?.getAttribute("href") || "",
            year: yearElement?.textContent?.trim() || "",
            type: typeElement?.textContent?.trim() || ""
          };
        }).filter(album => album.name && album.url && album.year && album.type != "Single");
      });

      info = { artistName, albums };
    } else {
      await page.waitForSelector("ytmusic-thumbnail-renderer.thumbnail:nth-child(3) > yt-img-shadow:nth-child(1) > img:nth-child(1)", { visible: true });
      artistName = await page.evaluate(() => document.querySelector(".strapline-text > a:nth-child(1)")?.textContent) || "";
      albumName = await page.evaluate(() => document.querySelector("h1.style-scope:nth-child(6) > yt-formatted-string:nth-child(1)")?.textContent) || "";
      albumYear = await page.evaluate(() => document.querySelector("yt-formatted-string.ytmusic-responsive-header-renderer:nth-child(2) > span:nth-child(3)")?.textContent) || "";
      info = { artistName, albumName, albumYear };
    }

    console.log(JSON.stringify(info));
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    browser.close();
  }
};

getInfo();
