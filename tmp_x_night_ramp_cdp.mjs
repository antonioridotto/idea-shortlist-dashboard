import { chromium } from 'playwright';
import fs from 'fs';

const statePath = '/Users/antonioridotto/.openclaw/workspace/memory/x-growth-state.json';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function readState() { try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { return {}; } }
function nextActionsCount(state) {
  const prev = Number(state.lastActionsCount ?? state.cycleCount);
  if (!Number.isFinite(prev) || prev <= 0) return 2;
  return Math.min(8, prev + 1);
}
async function isVisible(locator) { try { return await locator.first().isVisible(); } catch { return false; } }
async function tweetUrl(article) {
  const href = await article.locator('a[href*="/status/"]').first().getAttribute('href').catch(() => null);
  if (!href) return null;
  return href.startsWith('http') ? href : `https://x.com${href}`;
}

const result = { ok: false, targetCount: 2, actions: [], actionCounts: { like: 0, repost: 0, follow: 0 }, errors: [], notes: [] };
let browser;
try {
  const state = readState();
  result.targetCount = nextActionsCount(state);

  browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context via CDP');
  const page = context.pages()[0] || await context.newPage();

  await page.goto('https://x.com/search?q=(vibe%20coding%20OR%20mobile%20app%20OR%20ai%20builder%20OR%20vc)%20lang%3Aen%20-filter%3Areplies&src=typed_query&f=live', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);

  if (await isVisible(page.locator('input[name="text"], a[href="/i/flow/login"]'))) throw new Error('Not logged in');

  const done = new Set();

  const target = result.targetCount;
  const quotas = {
    repost: Math.max(1, Math.floor(target * 0.25)),
    follow: Math.max(1, Math.floor(target * 0.25)),
    like: Math.max(1, target - Math.max(1, Math.floor(target * 0.25)) - Math.max(1, Math.floor(target * 0.25)))
  };

  for (let pass = 0; pass < 6 && result.actions.length < result.targetCount; pass++) {
    const articles = page.locator('article[data-testid="tweet"]');
    const count = await articles.count();

    for (let i = 0; i < Math.min(count, 20) && result.actions.length < result.targetCount; i++) {
      const a = articles.nth(i);
      const link = await tweetUrl(a);
      if (!link || done.has(link)) continue;

      const preferred = ['repost', 'follow', 'like']
        .filter(type => result.actionCounts[type] < quotas[type]);

      for (const type of preferred) {
        if (result.actions.length >= result.targetCount) break;

        if (type === 'like') {
          const btn = a.locator('[data-testid="like"]').first();
          if (await isVisible(btn)) {
            await btn.click({ timeout: 7000 });
            await sleep(800);
            result.actions.push({ type, link });
            result.actionCounts.like++;
            done.add(link);
            break;
          }
        } else if (type === 'repost') {
          const btn = a.locator('[data-testid="retweet"]').first();
          if (await isVisible(btn)) {
            await btn.click({ timeout: 7000 });
            const confirm = page.locator('[data-testid="retweetConfirm"]').first();
            if (await isVisible(confirm)) {
              await confirm.click({ timeout: 7000 });
              await sleep(900);
              result.actions.push({ type, link });
              result.actionCounts.repost++;
              done.add(link);
              break;
            }
          }
        } else if (type === 'follow') {
          const btn = a.locator('[data-testid$="-follow"], [data-testid="follow"]').first();
          if (await isVisible(btn)) {
            await btn.click({ timeout: 7000 });
            await sleep(900);
            result.actions.push({ type, link });
            result.actionCounts.follow++;
            done.add(link);
            break;
          }
        }
      }
    }

    if (result.actions.length < result.targetCount) {
      await page.mouse.wheel(0, 2200);
      await sleep(1400);
    }
  }

  const newState = {
    ...state,
    lastRun: new Date().toISOString(),
    lastActionsCount: result.actions.length,
    cycleCount: Number(state.cycleCount || 0) + 1,
    lastCyclePosted: result.actions.length > 0
  };
  fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));

  result.ok = result.actions.length > 0;
  result.notes.push(`Mix quotas -> repost:${quotas.repost} follow:${quotas.follow} like:${quotas.like}`);
  if (result.actions.length < result.targetCount) result.notes.push(`Target ${result.targetCount}, completed ${result.actions.length}`);

} catch (e) {
  result.errors.push(String(e?.message || e));
} finally {
  if (browser) await browser.close().catch(() => {});
}

console.log(JSON.stringify(result, null, 2));
