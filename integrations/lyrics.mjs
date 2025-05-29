import puppeteer from 'puppeteer';

const launch = () => puppeteer.launch({ userDataDir: 'G:/Root/puppet', headless: false, defaultViewport: null });

const corn_flake = `url('https://tinyurl.com/yx2wvxyn')`;
const remove_bastardization = lyrics => {
  lyrics = lyrics
      .replace(/".*tracking.*musixmatch.*com\/?.*"/gi, corn_flake)
      .replace(/url\(.*\)/g, corn_flake)
      .replace(/<svg.*svg>/g, "")
      .replace(/<h2.*h2>/g, "")
  const slice_begin = lyrics.indexOf(`<div class="css-175oi2r r-1m7mu0x r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-17brrzu" style="opacity: 0;"></div>`);
  const slice_end = lyrics.indexOf(`<div dir="auto" class="css-146c3p1 r-fdjqy7 r-a023e6 r-1kfrs79 r-1cwl3u0 r-lrvibr" style="color: var(--mxm-contentPrimary);">Share</div>`);
  return lyrics.slice(0, slice_begin) + lyrics.slice(slice_end);
};

const f = Math.random() * 10000;
const min = Math.random() * 1000;
const max = 10000 - Math.random() * 1000;
const sf = Math.min(Math.max(f, min), max);
let browser = await launch();
export const musix = async (query, callback) => {
    try {
        if (!browser.connected) browser = await launch();
        const pages = await browser.pages();
        pages.forEach(page => page.isClosed() || setTimeout(() => page.close(), sf * Math.random()));
        const page = await browser.newPage();
        await page.goto("https://www.musixmatch.com/search");
        await page.waitForSelector(".css-11aywtz");
        await page.type(".css-11aywtz", query);
        await page.keyboard.press('Enter');
        await page.waitForSelector("::-p-text(Best result)");
        const anchor = await page.locator("a[href^='/lyrics']").waitHandle();
        const hnd = (await anchor.getProperty("href")).toString();
        const link = hnd.slice(hnd.indexOf(":") + 1);
        await page.goto(link);
        const lyrics = await (await page.locator(".css-175oi2r.r-13awgt0.r-eqz5dr.r-11c0sde").waitHandle()).evaluate(el => el.innerHTML);
        callback(remove_bastardization(lyrics));
        console.log("lyrics were requested.", link);
    } catch {
        console.warn("Puppeteer navigation cancelled.");
    }
};