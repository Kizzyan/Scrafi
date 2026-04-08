import puppeteer from "puppeteer";
import { Util } from "./utils/util";

/*
 -> Supported Websites:
  • WeebCentral (manga)
  • Mangadex (manga)
  • Webtoons (manhwa)
  • GoodReads (books)
  • Letterboxd (movies)
  • Anilist (anime)
  • TheMovieDB (series/movies)
  • AO3 (fanfic)
  • IMDB (series/movies)
  • AlbumOfTheYear (albums)
  • Last.fm (albums)
*/

const url = process.argv[2];
const util = new Util();

let title: string;
let creator: string;
let img: string;
let total: string;
let tag: string;
let category: string;
let domain: string;
let imgName: string;
let year: number;
let tags: string[];

const getInfo = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  // const browser = await util.launchLoggedInBrowser();

  const page = await browser.newPage();
  await page.setUserAgent(util.generateRandomUA());
  let info;

  if (url.includes("letterboxd")) url + "genres"

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    if (url.includes("weebcentral")) {

      domain = "WeebCentral"
      await page.waitForSelector("section.flex:nth-child(3) > picture:nth-child(1) > img:nth-child(2)", { visible: true });
      title = await page.evaluate(() => document.querySelector("#top > section.flex.flex-col.md\\:flex-row.gap-4.md\\:gap-8 > section.md\\:w-8\\/12.flex.flex-col.gap-4 > h1")?.textContent) || "";
      creator = await page.evaluate(() => document.querySelector("section.hidden:nth-child(5) > ul:nth-child(1) > li:nth-child(1) > span:nth-child(2) > a:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector("section.flex:nth-child(3) > picture:nth-child(1) > img:nth-child(2)") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector("a.hover\\:bg-base-300:nth-child(1) > span:nth-child(2) > span:nth-child(1)")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector("section.hidden:nth-child(5) > ul:nth-child(1) > li:nth-child(5) > span:nth-child(2)")?.textContent) || "";
      category = "Manga";
      if (creator.split(" ").length >= 2) {
        const creatorSplit = creator.split(' ');
        const formattedcreator = creatorSplit.map(creatorSplit => creatorSplit.charAt(0).toUpperCase() + creatorSplit.slice(1).toLowerCase());
        creator = `${formattedcreator[1]} ${formattedcreator[0]}`;
      }
      total = total.split(" ")[1];
      title = `${title} (Manga)`
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("section.hidden:nth-child(5) > ul:nth-child(1) > li:nth-child(2) > span > a");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .split(" ")
          .map(word => word[0].toUpperCase() + word.slice(1, word.length))
          .concat()
          .toString()
          .replaceAll(",", "")
          .replaceAll("ScienceFiction", "Sci-fi")
          .replace("ShoujoAi", "Yuri") || '');
      });
      year = +yearStr
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("mangadex")) {

      domain = "Mangadex"
      await page.waitForSelector("#__nuxt > div.flex.flex-grow.text-color > div.flex.flex-col.flex-grow > div.md-content.flex-grow > div > div:nth-child(3) > div > a > img.rounded.shadow-md.w-full.h-auto", { visible: true });
      title = await page.evaluate(() => document.querySelector("#__nuxt > div.flex.flex-grow.text-color > div.flex.flex-col.flex-grow > div.md-content.flex-grow > div > div.title > p")?.textContent) || "";
      creator = await page.evaluate(() => document.querySelector("#__nuxt > div.flex.flex-grow.text-color > div.flex.flex-col.flex-grow > div.md-content.flex-grow > div > div.title > div.flex.flex-row.gap-2 > div")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector("#__nuxt > div.flex.flex-grow.text-color > div.flex.flex-col.flex-grow > div.md-content.flex-grow > div > div:nth-child(3) > div > a > img.rounded.shadow-md.w-full.h-auto") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector("div.rounded-sm:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1) > a:nth-child(1) > span:nth-child(2) > span:nth-child(1)")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector("span.tag > span:nth-child(2)")?.textContent) || "";
      category = "Manga";
      total = total.match(/\d+(\.\d+)*/g)?.toString() || "";
      title = `${title} (Manga)`
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("div.mb-2:nth-child(3) > div:nth-child(2) > a > span");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .split(" ")
          .map(word => word[0].toUpperCase() + word.slice(1, word.length))
          .concat()
          .toString()
          .replaceAll(",", "")
          .replaceAll("ScienceFiction", "Sci-fi")
          .replace("Girls'Love", "Yuri") || '');
      });
      year = +(yearStr.match(/(?<=\ )[0-9]+(?! ,)/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("webtoons")) {

      domain = "Webtoons"
      try {
        let { tempImg, tempTags, tempYear } = await util.getCoverTagsYear(browser, title);
        img = tempImg || "";
        tags = tempTags || "";
        year = tempYear || 0;
      } finally {
        title = await page.evaluate(() => document.querySelector("#content > div.cont_box > div.detail_header.type_white > div.info > h1")?.textContent) || "";
        creator = await page.evaluate(() => document.querySelector(".creator_area")?.textContent) || "";
        total = await page.evaluate(() => document.querySelector("#_listUl > li:nth-child(1) > a > span.subj > span")?.textContent) || "";
        tag = "Manhwa";
        imgName = util.createImgName(title, tag, year);
        creator = creator.replaceAll(",", "/").replaceAll(" creator info", "");
        total = total.match(/\b(\d+)\b/)?.shift() || "";
      }
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("goodreads")) {

      domain = "GoodReads"
      await page.waitForSelector("div.BookCover > div.BookCover__image > div:nth-child(1) > img", { visible: true });
      title = await page.evaluate(() => document.querySelector(".BookPageTitleSection__title > h1.Text")?.textContent) || "";
      creator = await page.evaluate(() => document.querySelector(".ContributorLinksList > span:nth-child(1) > a:nth-child(1) > span:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector("div.BookCover > div.BookCover__image > div:nth-child(1) > img") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector(".FeaturedDetails > p:nth-child(1)")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector(".FeaturedDetails > p:nth-child(2)")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("#__next > div.PageFrame.PageFrame--siteHeaderBanner > main > div.BookPage__gridContainer > div.BookPage__rightColumn > div.BookPage__mainContent > div.BookPageMetadataSection > div.BookPageMetadataSection__genres > ul > span:nth-child(1) > span > a > span");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .replaceAll(" ", "")
          .replaceAll("ScienceFiction", "Sci-fi") || '');
      });

      category = "Book";
      total = total.split(" ")[0];
      year = +(yearStr.match(/(?<=, )[0-9]+/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("letterboxd")) {

      domain = "Letterboxd"
      await page.waitForSelector("section.poster-list > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)", { visible: true });
      title = await page.evaluate(() => document.querySelector("div.details > h1.primaryname > span.name")?.textContent) || "";
      creator = await page.evaluate(() => document.querySelector(".contributor > span:nth-child(1)")?.textContent) || "";
      img = "empty-poster";
      while (img.includes("empty-poster")) {
        img = await page.evaluate(() => (document.querySelector("section.poster-list > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)") as HTMLImageElement)?.src);
      }
      let yearStr = await page.evaluate(() => document.querySelector(".releasedate > a:nth-child(1)")?.textContent) || "";
      total = await page.evaluate(() => document.querySelector(".text-link")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("div.capitalize:nth-child(2) > p:nth-child(1) > a");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .replaceAll(" ", "")
          .replaceAll("ScienceFiction", "Sci-fi") || '');
      });

      category = "Movie";
      total = total.split(" ")[1].match(/[0-9]+/)?.toString() || "";
      year = +yearStr
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("archiveofourown")) {

      domain = "AO3"
      title = await page.evaluate(() => document.querySelector("h2.title")?.textContent?.trim()) || "";
      creator = await page.evaluate(() => document.querySelector("h3.byline > a:nth-child(1)")?.textContent) || "";
      total = await page.evaluate(() => document.querySelector("dd.words")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector("dd.published")?.textContent) || "";
      if (!title || !creator) { // In case fic is +18
        title = await page.evaluate(() => document.querySelector(".header > h4:nth-child(1) > a:nth-child(1)")?.textContent?.trim()) || "";
        creator = await page.evaluate(() => document.querySelector(".header > h4:nth-child(1) > a:nth-child(2)")?.textContent) || "";
        tags = await page.evaluate(() => {
          const tagElements = document.querySelectorAll("li.relationships > a");
          return Array.from(tagElements).map(element => element.textContent?.trim().replaceAll(" ", "").replace("&", "_") || '');
        });
      } else {
        tags = await page.evaluate(() => {
          const tagElements = document.querySelectorAll("dd.relationship > ul:nth-child(1) > li > a");
          return Array.from(tagElements).map(element => element.textContent?.trim().replaceAll(" ", "").replace("&", "_") || '');
        });
      }

      img = "";
      category = "Fanfic";
      year = +(yearStr.match(/[0-9]+(?! -)/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, category, year };

    } else if (url.includes("backloggd")) {

      domain = "Backloggd"
      title = await page.evaluate(() => document.querySelector("div.px-1:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h1:nth-child(1)")?.textContent?.trim()) || "";
      creator = await page.evaluate(() => document.querySelector("div.sub-title:nth-child(4) > a:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector("div.overflow-wrapper:nth-child(1) > img.card-img") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector("div.h-100 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > p:nth-child(1)")?.textContent) || "";
      let yearStr = await util.getDivBelow("Released", page, domain);
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("#game-body > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span > a");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .replaceAll(" ", "")
          .replaceAll("ScienceFiction", "Sci-fi") || '');
      });

      category = "Game";
      year = +(yearStr.match(/(?<=, )[0-9]+/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("anilist")) {
      domain = "Anilist"
      await page.waitForSelector("img.cover", { visible: true });
      title = await page.evaluate(() => document.querySelector(".header > div:nth-child(1) > div:nth-child(2) > h1:nth-child(1)")?.textContent?.trim()) || "";
      img = await page.evaluate(() => (document.querySelector("img.cover") as HTMLImageElement)?.src);
      total = await util.getDivBelow("Episodes", page, domain);
      creator = await util.getDivBelow("Studios", page, domain);
      let yearStr = await util.getDivBelow("Start Date", page, domain);
      const genres = await page.evaluate(() => {
        const genreDiv = Array.from(document.querySelectorAll('div[class*="data-set"]')).find(div =>
          div.querySelector('.type')?.textContent?.trim() === 'Genres'
        );
        if (!genreDiv) return [];
        const genreLinks = genreDiv.querySelectorAll('.value a');
        return Array.from(genreLinks).map(link => link.textContent?.trim() || '');
      });

      category = "Anime";
      tags = genres.filter(genre => genre.length > 0).map(tag => tag.replaceAll("ScienceFiction", "Sci-fi"));
      creator = creator.replaceAll("\t", "").replaceAll("\n", "");
      title = `${title} (Anime)`
      year = +(yearStr.match(/(?<=, )[0-9]+/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("themoviedb")) {

      domain = "TheMovieDB"
      await page.waitForSelector("div.poster > div.image_content > div > img", { visible: true });
      title = await page.evaluate(() => document.querySelector("div.title > h2 > a")?.textContent?.trim()) || "";
      creator = await page.evaluate(() => document.querySelector("li.profile > p:nth-child(1) > a:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector("div.poster > div.image_content > div > img") as HTMLImageElement)?.src);
      let lastSeason = await page.evaluate(() => document.querySelector("section.panel.season > div.season.card > div > div.content > div > h2 > a")?.textContent) || "";
      let lastEpisode = await page.evaluate(() => document.querySelector("section.panel.season > div.season.card > div > div.content > div > div.flex.rating_wrapper > h4")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector(".release_date")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll(".genres > a");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .replaceAll(" ", "")
          .replaceAll("ScienceFiction", "Sci-fi")
          .replace("&", "_") || '');
      });

      category = util.checkForSubstring(title, "kamen") ? "Tokusatsu" : "Series";
      total = `S${lastSeason?.replace(/\D/g, "")}.E${lastEpisode.split("•")[1]?.split(" ")[1]}`;
      year = +(yearStr.match(/[0-9]+/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("imdb")) {

      domain = "IMDB"
      await page.waitForSelector(".ipc-media--poster-l > img:nth-child(1)", { visible: true });
      title = await page.evaluate(() => document.querySelector(".hero__primary-text")?.textContent?.trim()) || "";
      creator = await util.getDivBelow("Creator", page, domain);
      img = await page.evaluate(() => (document.querySelector(".ipc-media--poster-l > img:nth-child(1)") as HTMLImageElement)?.src);
      img = img.replace(/(?<=V1_).*?(?=\.jpg)/, "");
      let yearStr = await page.evaluate(() => document.querySelector("ul.ipc-inline-list--show-dividers:nth-child(2) > li:nth-child(2) > a:nth-child(1)")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("a.ipc-chip > span:nth-child(1)");
        return Array.from(tagElements).map(element => element.textContent
          ?.trim()
          .replaceAll(" ", "")
          .replaceAll("ScienceFiction", "Sci-fi")
          .replace("&", "_") || '');
      });

      category = util.checkForSubstring(title, "kamen") ? "Tokusatsu" : "Series";
      total = await page.evaluate(() => document.querySelector("div.ipc-list-card--hasActions:nth-child(1) > div:nth-child(1) > div:nth-child(2) > ul:nth-child(1) > li:nth-child(1) > a:nth-child(1)")?.textContent) || "";
      year = +(yearStr.match(/[0-9]+(?!-)/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("albumoftheyear")) {

      domain = "AOTY"
      await page.waitForSelector(".showImage > img:nth-child(1)", { visible: true });
      title = await page.evaluate(() => document.querySelector("h1.albumTitle > span:nth-child(1)")?.textContent?.trim()) || "";
      creator = await page.evaluate(() => document.querySelector(".artist > span:nth-child(1) > span:nth-child(1) > a:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector(".showImage > img:nth-child(1)") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector(".totalLength")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector("div.detailRow:nth-child(2) > a:nth-child(2)")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("div.detailRow:nth-child(5) > a");
        return Array.from(tagElements).map(element => element.textContent?.trim().replaceAll(" ", "").replace("&", "_") || '');
      });

      category = "Album";
      total = total.match(/[0-9]+(?!-)/)?.toString() || ""
      year = +(yearStr.match(/[0-9]+(?!-)/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    } else if (url.includes("last.fm")) {

      domain = "Last.fm"
      // TODO
      await page.waitForSelector(".showImage > img:nth-child(1)", { visible: true });
      title = await page.evaluate(() => document.querySelector("h1.albumTitle > span:nth-child(1)")?.textContent?.trim()) || "";
      creator = await page.evaluate(() => document.querySelector(".artist > span:nth-child(1) > span:nth-child(1) > a:nth-child(1)")?.textContent) || "";
      img = await page.evaluate(() => (document.querySelector(".showImage > img:nth-child(1)") as HTMLImageElement)?.src);
      total = await page.evaluate(() => document.querySelector(".totalLength")?.textContent) || "";
      let yearStr = await page.evaluate(() => document.querySelector("div.detailRow:nth-child(2) > a:nth-child(2)")?.textContent) || "";
      tags = await page.evaluate(() => {
        const tagElements = document.querySelectorAll("div.detailRow:nth-child(5) > a");
        return Array.from(tagElements).map(element => element.textContent?.trim().replaceAll(" ", "").replace("&", "_") || '');
      });

      category = "Album";
      total = total.match(/[0-9]+(?!-)/)?.toString() || ""
      year = +(yearStr.match(/[0-9]+(?!-)/)?.toString() || "")
      imgName = util.createImgName(title, category, year);
      info = { title, creator, img, total, tags, domain, imgName, category, year };

    }

    console.log(JSON.stringify(info));
  } catch (error) {
    console.log("Error: " + error);
  } finally {
    browser.close();
  }
};

getInfo();
