#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '@jobagent/observability';
import YAML from 'yaml';
import 'dotenv/config';
import { discoverFromFeed } from './discover';
import { apply as applyGreenhouse } from '@jobagent/automation/src/playwright/runners/greenhouse';
import { upsertJobPost } from './persist';

const program = new Command();

program
  .name('jobagent')
  .description('AI agent for discovering and applying to jobs with approvals')
  .version('0.1.0');

program
  .command('discover')
  .description('Discover jobs from feed sources and store')
  .requiredOption('--feeds <file>', 'Path to feeds.yaml')
  .action(async (opts) => {
    const file = path.resolve(process.cwd(), opts.feeds);
    const raw = fs.readFileSync(file, 'utf-8');
    const cfg = YAML.parse(raw);
    logger.info({ feeds: cfg.feeds?.length ?? 0 }, 'Starting discovery');
    for (const feed of cfg.feeds ?? []) {
      const items = await discoverFromFeed(feed);
      logger.info({ source: feed.type, count: items.length }, 'Discovered items');
      for (const it of items) {
        if (!it.url) continue;
        upsertJobPost({
          source: feed.type,
          url: it.url,
          title: it.title || 'Unknown',
          company: cfg.company || 'Unknown',
          location: it.location
        });
      }
    }
    logger.info('Discovery completed and stored');
  });

program
  .command('dashboard')
  .description('Launch dashboard (stub)')
  .action(async () => {
    logger.info('Dashboard not yet implemented');
  });

program
  .command('approve')
  .description('Auto-approve queue (stub)')
  .option('--auto <bool>', 'Auto approve new jobs above min score', 'true')
  .option('--min-score <num>', 'Minimum score threshold', '0.72')
  .action(async (opts) => {
    logger.info({ opts }, 'Approve stub executed');
  });

program
  .command('apply')
  .description('Apply to a specific job (stub)')
  .requiredOption('--job <url>', 'Job post URL')
  .requiredOption('--candidate <id>', 'Candidate ID')
  .option('--headful', 'Run browser headful', false)
  .action(async (opts) => {
    logger.info({ job: opts.job, candidate: opts.candidate, headful: !!opts.headful }, 'Apply start');
    if (String(opts.headful) === 'true') process.env.PLAYWRIGHT_HEADLESS = 'false';
    try {
      if (opts.job.includes('greenhouse') || opts.job.includes('boards.greenhouse.io')) {
        const result = await applyGreenhouse({
          job: { url: opts.job, title: 'Unknown', company: 'Unknown' },
          resumePath: process.env.RESUME_PATH || 'resume.pdf'
        });
        logger.info({ result }, 'Apply finished');
        if (result.runDir) {
          logger.info({ url: `http://localhost:3000/runs` }, 'Open dashboard runs to view artifacts');
        }
      } else {
        logger.warn('Unsupported URL for apply runner. Only Greenhouse is implemented.');
      }
    } catch (e) {
      logger.error({ err: e }, 'Apply failed');
      process.exitCode = 1;
    }
  });

program.parseAsync();


