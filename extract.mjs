import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import Turndown from 'turndown'

const CWD = process.cwd()
const PLAYLISTS_OLD_DIR = path.join(CWD, 'playlists-old')
const PLAYLISTS_EXTRACTED_DIR = path.join(CWD, 'playlists-extracted')
const turndown = new Turndown()

run()

function run() {
  const successes = []
  const failures = []
  const playlists = fs.readdirSync(PLAYLISTS_OLD_DIR)

  for (const filename of playlists) {
    try {
      const html = fs.readFileSync(`${PLAYLISTS_OLD_DIR}/${filename}`, 'utf-8')
      const $ = cheerio.load(html)

      const mainPlaylistP = $('p.playlist')

      let combinedHtml = ''

      if (mainPlaylistP.length > 0) {
        const playlistHtml = mainPlaylistP.html()

        if (!playlistHtml || !playlistHtml.trim()) {
          failures.push(filename)
          console.warn(`${filename} contains an empty main playlist paragraph`)
          continue
        }

        combinedHtml = $.html(mainPlaylistP)
      } else {
        // Fallback: Get all top-level elements with class "playlist" that have content
        // This is for cases where there isn't a main playlist paragraph
        const playlistElements = $('.playlist').filter(function () {
          // Only include elements that aren't nested inside other playlist elements
          return (
            $(this).text().trim() !== '' &&
            $(this).parents('.playlist').length === 0
          )
        })

        if (playlistElements.length === 0) {
          failures.push(filename)
          console.warn(
            `${filename} does not contain a non-empty playlist element`
          )
          continue
        }

        playlistElements.each(function () {
          combinedHtml += $.html(this)
        })
      }

      if (!combinedHtml) {
        failures.push(filename)
        console.warn(`${filename} playlist elements could not be combined`)
        continue
      }

      let $content = cheerio.load(combinedHtml)
      $content('a').each(function () {
        const linkText = $content(this).text().trim()
        // Check if the link only contains < or > characters (with possible whitespace)
        if (/^[<>\s]+$/.test(linkText)) {
          $content(this).remove()
        }
      })

      const playlistHtml = $content.html()

      const markdown = turndown.turndown(playlistHtml)
      if (!markdown.trim()) {
        throw new Error('Unable to extract playlist')
      }

      const date = path.basename(filename, '.html')
      const bgColor = extractBackgroundColor($, html)

      const markdownWithMetadata = `---
        date: ${date}
        backgroundColor: '${bgColor}'
        ---

        ${markdown}`
        .split('\n')
        .map((line) => line.trimStart())
        .join('\n')

      const dest = `${PLAYLISTS_EXTRACTED_DIR}/${date}.md`
      fs.writeFileSync(dest, markdownWithMetadata, 'utf-8')
      successes.push(filename)
      console.info('Extracted playlist from', filename, 'into', dest)
    } catch (error) {
      failures.push(filename)
      console.error(
        `Unable to extract playlist from ${filename}. Error:`,
        error
      )
    }
  }

  console.info(`successes: ${successes.length}, failures: ${failures.length}`)

  fs.writeFileSync(
    `${CWD}/extraction-failures.json`,
    JSON.stringify({ failures }, null, 2),
    'utf-8'
  )
}

function extractBackgroundColor($, html) {
  const body = $('body')
  const bgColor = body.attr('bgcolor')

  if (bgColor) {
    return bgColor
  }

  const style = body.attr('style')
  if (style) {
    const match = style.match(/background-color:\s*([^;]+)/i)
    if (match) {
      return match[1].trim()
    }
  }

  return ''
}
