#!/usr/bin/env node
/**
 * Post a 6-slide TikTok slideshow via Postiz API.
 * 
 * Usage: node post-to-tiktok.js --config <config.json> --dir <slides-dir> --caption "caption text" --title "post title"
 * 
 * Uploads slide1.png through slide6.png, then creates a TikTok slideshow post.
 * Posts as SELF_ONLY (draft) by default — user adds music then publishes.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const configPath = getArg('config');
const dir = getArg('dir');
const rawCaption = getArg('caption');
const title = getArg('title') || '';

if (!configPath || !dir || !rawCaption) {
  console.error('Usage: node post-to-tiktok.js --config <config.json> --dir <dir> --caption "text" [--title "text"]');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const BASE_URL = 'https://api.postiz.com/public/v1';

// TikTok caption field does not reliably preserve line breaks via this API path.
// Normalize to a single-line caption to avoid literal "\\n" rendering.
const caption = rawCaption.replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

async function uploadImage(filePath) {
  const form = new FormData();
  const blob = new Blob([fs.readFileSync(filePath)], { type: 'image/png' });
  form.append('file', blob, path.basename(filePath));

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': config.postiz.apiKey },
    body: form
  });
  return res.json();
}

(async () => {
  console.log('📤 Uploading slides...');
  const images = [];
  for (let i = 1; i <= 6; i++) {
    const filePath = path.join(dir, `slide${i}.png`);
    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ Missing: ${filePath}`);
      process.exit(1);
    }
    console.log(`  Uploading slide ${i}...`);
    const resp = await uploadImage(filePath);
    if (resp.error) {
      console.error(`  ❌ Upload error: ${JSON.stringify(resp.error)}`);
      process.exit(1);
    }
    images.push({ id: resp.id, path: resp.path });
    console.log(`  ✅ ${resp.id}`);
    // Rate limit buffer
    if (i < 6) await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n📱 Creating TikTok post...');
  const privacy = config.posting?.privacyLevel || 'SELF_ONLY';
  
  const postRes = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': config.postiz.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'now',
      date: new Date().toISOString(),
      shortLink: false,
      tags: [],
      posts: [{
        integration: { id: config.postiz.integrationId },
        value: [{ content: caption, image: images }],
        settings: {
          __type: 'tiktok',
          title: title,
          privacy_level: privacy,
          duet: false,
          stitch: false,
          comment: true,
          autoAddMusic: 'no',
          brand_content_toggle: false,
          brand_organic_toggle: false,
          video_made_with_ai: true,
          content_posting_method: 'UPLOAD'
        }
      }]
    })
  });

  const result = await postRes.json();
  console.log('✅ Posted!', JSON.stringify(result));

  // Save metadata
  const metaPath = path.join(dir, 'meta.json');
  const postizPostId = result[0]?.postId;
  const postedAt = new Date().toISOString();
  const meta = {
    postId: postizPostId,
    postizPostId,
    caption,
    title,
    privacy,
    postedAt,
    images: images.length
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`📋 Metadata saved to ${metaPath}`);

  // Append durable post index for reliable analytics reconciliation
  // Location: <config dir>/post-index.jsonl
  const indexPath = path.join(path.dirname(configPath), 'post-index.jsonl');
  const indexRow = {
    postizPostId,
    postedAt,
    title,
    caption,
    localDir: dir,
    integrationId: config.postiz.integrationId
  };
  fs.appendFileSync(indexPath, JSON.stringify(indexRow) + '\n');
  console.log(`🧾 Indexed post in ${indexPath}`);
})();
