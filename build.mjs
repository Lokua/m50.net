import fs from 'node:fs'
import path from 'node:path'
import Handlebars from 'Handlebars'
import matter from 'gray-matter'
import { marked } from 'marked'
import prettier from 'prettier'
import prettierHtmlPlugin from 'prettier/plugins/html'

const CWD = process.cwd()
const PLAYLISTS_DIR = path.join(CWD, 'playlists')
const TEMPLATES_DIR = path.join(CWD, 'templates')
const PLAYLISTS_HTML_DIR = path.join(CWD, 'playlists-html')

const playlists = fs
  .readdirSync(PLAYLISTS_DIR)
  .filter((filename) => filename.endsWith('.md'))
const template = fs.readFileSync(`${TEMPLATES_DIR}/playlist.hbs`, 'utf-8')
const templateFn = Handlebars.compile(template)

const failures = []

for (const [index, filename] of playlists.entries()) {
  try {
    const date = path.basename(filename, '.md')

    // The raw contents of the playlist file
    const rawContent = fs.readFileSync(`${PLAYLISTS_DIR}/${filename}`, 'utf-8')

    // Split the playlist file into metadata and actual markdown content
    const { data, content } = matter(rawContent)

    // Compile markdown into html
    const playlistHtml = marked(content)

    // Compile the playlist template with provided markdown metadata and content
    const compiled = templateFn({
      // prefer the date written in markdown metadata,
      // otherwise fallback to the filename
      title: data.date || date,
      previousPlaylistLink: saveGetLink(playlists[index - 1]),
      nextPlaylistLink: saveGetLink(playlists[index + 1]),
      backgroundColor: data.backgroundColor,
      playlist: playlistHtml,
    })

    // "Prettify" the HTML so it looks nice in case you
    // want to abandon this process you're not left with a giant
    // unformatted HTML blob
    const html = await prettier.format(compiled, {
      parser: 'html',
      plugins: [prettierHtmlPlugin],
    })

    // Output the final HTML content
    const dest = `${PLAYLISTS_HTML_DIR}/${date}.html`
    fs.writeFileSync(dest, html, 'utf-8')
    console.info('Successfully compiled', filename, 'into', dest)
  } catch (error) {
    failures.push(filename)
    console.error(`Unable to write ${filename}. Error:`, error)
  }
}

if (failures.length) {
  fs.writeFileSync(
    './build-failures.json',
    JSON.stringify({ failures }, null, 2),
    'utf-8'
  )
}

function saveGetLink(playlist) {
  return playlist ? path.basename(playlist, '.md') + '.html' : ''
}
