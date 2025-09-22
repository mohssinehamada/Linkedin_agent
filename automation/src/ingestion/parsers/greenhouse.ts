import * as cheerio from 'cheerio';

export function parseGreenhouseBoard(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const postings: { title: string; url: string; location?: string }[] = [];
  $('a[href*="/jobs/"]').each((_, a) => {
    const url = new URL($(a).attr('href')!, baseUrl).toString();
    const title = $(a).text().trim();
    const location = $(a).closest('div').find('.location').first().text().trim() || undefined;
    if (title && url) postings.push({ title, url, location });
  });
  return postings;
}

export function parseGreenhousePosting(html: string) {
  const $ = cheerio.load(html);
  const title = $('h1').first().text().trim();
  const company = $('meta[property="og:site_name"]').attr('content') || '';
  const location = $('.location').first().text().trim() || undefined;
  const description = $('.content').text().trim() || $('body').text().trim();
  return { title, company, location, description };
}


