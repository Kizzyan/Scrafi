import { Browser, Page } from "puppeteer";
import puppeteer from 'puppeteer';
import path from 'path';
import os from 'os';

const altUrl = "https://mangadex.org/search?q=" // Used for retrieving webtoons covers (since webtoons site is horrendous)
export class Util {

  generateRandomUA = () => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
    ];
    const randomUAIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomUAIndex];
  }

  getCoverTagsYear = async (browser: Browser, title: string) => {
    const newPage = await browser.newPage();
    await newPage.setUserAgent(this.generateRandomUA());
    await newPage.goto(`${altUrl}${title}`, { waitUntil: "domcontentloaded" });
    await newPage.waitForSelector("a.manga-card-dense:nth-child(1) > div:nth-child(1) > div:nth-child(3) > a:nth-child(1) > img:nth-child(1)", {
      visible: true,
    });
    const tempImg = await newPage.evaluate(() => document.querySelector("a.manga-card-dense:nth-child(1) > div:nth-child(1) > div:nth-child(3) > a:nth-child(1) > img:nth-child(1)")?.textContent);
    let yearStr = await newPage.evaluate(() => document.querySelector("span.tag > span:nth-child(2)")?.textContent) || "";
    let tempTags = await newPage.evaluate(() => {
      const tagElements = document.querySelectorAll("div.mb-2:nth-child(3) > div:nth-child(2) > a > span");
      return Array.from(tagElements).map(element => element.textContent?.trim() || '');
    });
    let themes = await newPage.evaluate(() => {
      const tagElements = document.querySelectorAll("div.mb-2:nth-child(4) > div:nth-child(2) > a > span");
      return Array.from(tagElements).map(element => element.textContent?.trim() || '');
    });
    tempTags = tempTags.concat(themes)
    let tempYear = +(yearStr.match(/(?<=\ )[0-9]+(?! ,)/)?.toString() || "")
    await newPage.close();
    return { tempImg, tempTags, tempYear };
  }

  createImgName = (title: string, category: string, year: number) => {
    let cleanedTitle = title
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")

    return `${cleanedTitle}_${year}_(${category})`
  }

  async getDivBelow(textParam: string, page: Page, domain: string) {
    let result = await page.evaluate((text, domain) => {
      let xpath = "";
      switch (domain) {
        case "Anilist":
          xpath = `//div[text()="${text}"]/following-sibling::div[1]`; break;
        case "IMDB":
          xpath = `//span[text()="${text}"]/following-sibling::div[1]/ul/li/a`; break;
        case "Backloggd":
          xpath = `//div[contains(text(), "${text}")]/following-sibling::div[1]/a`; break;
        default:
          break;
      }
      const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.textContent : null;
    }, textParam, domain) || "";

    return result;
  }

  checkForSubstring(str: string, substring: string) {
    const regex = new RegExp(substring, "i");
    return regex.test(str);
  }

  async launchLoggedInBrowser() {
    let userDataDir: string;
    let executablePath: string;

    if (os.platform() === 'linux') {
      userDataDir = path.join(os.homedir(), '.mozilla', 'firefox', '79ml65xv.default-release');
      executablePath = '/usr/bin/firefox';

      const browser = await puppeteer.launch({
        // product: 'firefox', // IMPORTANT: Tell Puppeteer it's Firefox
        headless: true,
        executablePath: executablePath,
        userDataDir: userDataDir,
        args: [
          '--no-sandbox',
          '-profile',
          userDataDir,
        ],
        defaultViewport: null,
        // timeout: 5000,
      });

      return browser;
    } else {
      switch (os.platform()) {
        case 'win32':
          userDataDir = path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data');
          executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
          break;
        case 'darwin':
          userDataDir = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
          executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
          break;
        default:
          throw new Error('Unsupported platform');
      }

      const browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath,
        userDataDir: userDataDir,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          `--user-data-dir=${userDataDir}`,
        ],
        defaultViewport: null,
        timeout: 60000,
      });

      return browser;
    }
  }

}

