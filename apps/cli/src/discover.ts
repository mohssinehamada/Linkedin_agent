import { logger } from '@jobagent/observability';
import { fetchHtml } from '@jobagent/automation/src/ingestion/feeds';
import { parseGreenhouseBoard } from '@jobagent/automation/src/ingestion/parsers/greenhouse';
import { parseLeverBoard } from '@jobagent/automation/src/ingestion/parsers/lever';

export async function discoverFromFeed(feed: { type: string; url?: string; urls?: string[] }) {
  if (feed.type === 'greenhouse' && feed.url) {
    const html = await fetchHtml(feed.url);
    const items = parseGreenhouseBoard(html, feed.url);
    logger.info({ count: items.length, source: 'greenhouse' }, 'Parsed board');
    return items;
  }
  if (feed.type === 'lever' && feed.url) {
    const html = await fetchHtml(feed.url);
    const items = parseLeverBoard(html, feed.url);
    logger.info({ count: items.length, source: 'lever' }, 'Parsed board');
    return items;
  }
  logger.warn({ feed }, 'Unsupported feed (stub)');
  return [];
}


