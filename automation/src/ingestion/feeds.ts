import axios from 'axios';
import * as cheerio from 'cheerio';

export type Feed =
  | { type: 'greenhouse'; url: string }
  | { type: 'lever'; url: string }
  | { type: 'workday'; url: string }
  | { type: 'generic'; urls: string[] };

export async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobAgent/0.1; +https://example.com)'
    },
    timeout: 30000
  });
  return res.data as string;
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.startsWith('http')) links.add(href);
    else if (href.startsWith('/')) links.add(new URL(href, baseUrl).toString());
  });
  return Array.from(links);
}


