import * as cheerio from 'cheerio';

export function parseLeverBoard(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const postings: { title: string; url: string; location?: string }[] = [];
  $('a[href*="/jobs/"]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href) return;
    const url = new URL(href, baseUrl).toString();
    const title = $(a).find('.posting-title h5').text().trim() || $(a).text().trim();
    const location = $(a).find('.posting-categories .location').text().trim() || undefined;
    if (title && url) postings.push({ title, url, location });
  });
  return postings;
}

export function parseLeverPosting(html: string) {
  const $ = cheerio.load(html);
  const title = $('.posting-headline h2').first().text().trim() || $('h2').first().text().trim();
  const company = $('meta[property="og:site_name"]').attr('content') || '';
  const location = $('.posting-headline .location').first().text().trim() || undefined;
  const description = $('.section-wrapper.description').text().trim() || $('body').text().trim();
  return { title, company, location, description };
}


