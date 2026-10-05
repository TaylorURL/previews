// Captures a live preview at desktop and phone size, for the letter that
// carries it.
//
//   node scripts/shot.mjs <slug> <out-dir>
//
// Writes <out-dir>/<slug>-desktop.png (1440 x 900) and <out-dir>/<slug>-phone.png
// (390 x 844 at twice the density). The page is the live subdomain, so what the
// owner is shown is what they will find when they click.
//
// Chromium comes from CHROMIUM_PATH, then the system's own chromium (the Pi),
// then the Playwright cache (a Mac with Playwright installed once).

import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const [slug, out] = process.argv.slice(2)
if (!slug || !out) {
  console.error('usage: node scripts/shot.mjs <slug> <out-dir>')
  process.exit(2)
}

function browserPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  for (const path of ['/usr/bin/chromium-browser', '/usr/bin/chromium']) {
    if (existsSync(path)) return path
  }
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (existsSync(cache)) {
    const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()
    for (const build of builds) {
      for (const app of [
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      ]) {
        const path = join(cache, build, app)
        if (existsSync(path)) return path
      }
    }
  }
  throw new Error('no Chromium found; set CHROMIUM_PATH')
}

const url = `https://${slug}.taylorurl.com/`
const browser = await chromium.launch({ executablePath: browserPath() })
try {
  const shots = [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false },
    { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true },
  ]
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: shot.deviceScaleFactor,
      isMobile: shot.isMobile,
      hasTouch: shot.isMobile,
    })
    const page = await context.newPage()
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    if (!response || response.status() !== 200) throw new Error(`${url} answered ${response?.status()}`)
    // Fonts and the hero image settle after network idle on a slow link.
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(out, `${slug}-${shot.name}.png`) })
    await context.close()
  }
} finally {
  await browser.close()
}
console.log(`captured ${slug}`)
