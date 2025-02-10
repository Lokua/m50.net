import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import Turndown from 'turndown'

const CWD = process.cwd()
const PLAYLISTS_OLD_DIR = path.join(CWD, 'playlists-old')
const PLAYLISTS_EXTRACTED_DIR = path.join(CWD, 'playlists-extracted')

const playlists = fs.readdirSync(PLAYLISTS_OLD_DIR)
const turndown = new Turndown()

for (const filename of playlists) {
  try {
    const html = fs.readFileSync(`${PLAYLISTS_OLD_DIR}/${filename}`, 'utf-8')
    const $ = cheerio.load(html)
    const playlistElement = $('p.playlist').html()

    const markdown = turndown.turndown(playlistElement)
    if (!markdown.trim()) {
      throw new Error('Unable to extract playlist')
    }

    const date = path.basename(filename, '.html')
    const bgColor = extractBackgroundColor($, html)

    const markdownWithMetadata = `---
    date: ${date}
    backgroundColor: '${bgColor}'
    ---
    
    `
      .split('\n')
      .map((line) => line.trimStart())
      .join('\n')
      .concat(markdown)

    const dest = `${PLAYLISTS_EXTRACTED_DIR}/${date}.md`
    fs.writeFileSync(dest, markdownWithMetadata, 'utf-8')
    console.info('Extracted playlist from', filename, 'into', dest)
  } catch (error) {
    console.error(`Unable to extract playlist from ${filename}. Error:`, error)
  }
}

function extractBackgroundColor($, html) {
  const body = $('body')
  const bgColor = body.attr('bgcolor')

  if (bgColor) {
    return bgColor
  }

  const style = body.attr('style')
  const match = style.match(/background-color:\s*([^;]+)/i)
  if (match) {
    return match[1].trim()
  }

  return ''
}
