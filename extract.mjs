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

      const $content = cheerio.load(combinedHtml)

      // Find and remove any links that appear to be navigation links
      $content('a').each(function () {
        const $link = $content(this)
        const href = $link.attr('href')
        const linkText = $link.text().trim()
        const linkHtml = $link.html()

        // Is this a navigation link?
        // 1. Check if it links to an HTML file (likely another playlist)
        // 2. Check if its text contains only angle brackets or entities
        const isNavigationLink =
          // Check if it links to another HTML file
          href &&
          href.match(/\.html$/) &&
          // Raw angle brackets in text
          (/^[<>\s]+$/.test(linkText) ||
            // Text contains HTML entities for brackets
            /(&gt;|&lt;)/.test(linkText) ||
            // HTML content has entities directly
            (linkHtml &&
              (/(&gt;|&lt;)/.test(linkHtml) || /^[<>\s]+$/.test(linkHtml))))

        if (isNavigationLink) {
          // Remove the navigation link
          $link.remove()
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
