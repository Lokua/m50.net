# m50.net Playlist Page Generator

This project uses the [handlebars](https://handlebarsjs.com/) templating system
to compile playlist files written in [markdown](https://www.markdownguide.org/)
into static HTML pages for the homie [m50](https://m50.net).

# Installation/Requirements

This project uses [Node.js](https://nodejs.org/en) and was written using
version 22. It will not work on older version of Node that don't support
`type: module`. Note that node is only required to run the build script, it is
not needed for any of the resulting HTML pages to work.

Assuming Node/NPM (NPM comes bundled with Node) has been installed and is
available on your path:

1. Download or clone this project
2. Open a command prompt and navigate to the root of this project
3. Run `npm install` - this will install the dependencies needed to parse
   markdown, populate templates, and make the resulting output look pretty

That's it for installation.

# How This Works

Project layout:

```
# This folder contains playlist files written in markdown
./playlists

# This folder contains the final, compiled HTML pages
# that you can copy to your server/host.
# You should not make any edits to these files as they'll get
# blown away the next time you run the build
./playlists-html

# Contains the playlist template file written in the handlebars
# templating language (a superset of HTML). This is where you
# can add anything meant for all pages
./templates

# This is the actual build script that passes the playlist files
# though the template and write the results to the playlists-html directory
./build.mjs
```

To compile the playlists:

1. Navigate to the root of this project via command prompt
2. Run `npm run build`; the status of each file's compilation will be logged
3. Copy the files in [playlists-html](/playlists-html) over to your host/server

## Playlist Format

A "playlist file" is a simple markdown document. In this case it is also
enhanced to support markdown metadata:

```md
---
date: 2025.02.24
backgroundColor: '#ff0000'
---
```

Metadata must be contained at the top of the file between two `---`. The date
will be used to complete the page's title, e.g. `m50 | 2025.02.24`. If not
provided the build script will dervive the title from the playlist file's name.
The `backgroundColor` will be added to the document body's inline style
attribute. This _should_ support any valid html color declaration like
`#ff0000`, `red` or `rgba(255, 0 0)` however when using hex you _must_ wrap the
value in quotation marks like in the example above. This is because the `#`
character is used to preceed comments in the metadata syntax. Quotes are _not_
needed for regular names or rgba declarations. This is the only metadata
supported at this time.

## Playlist Extraction

Playlist extraction and playlist building have been separated in order to
prevent accidentally overwriting manual changes you might want to make to
playlists. The rules are:

- `playlists` represent the "source of truth" for what will populate a playlist
  page. This can be manually edited if needed and is where you should place new
  playlists going forward.
- `playlists-html` should _not_ be edited. This is the final HMTL page and any
  edits you make to these will be lost the next time you run the build.
- `playlists-old` place all old HTML pages here.
- `playlists-extracted` this is where we'll temporarily store playlists that
  have been extracted from the old pages and converted into markdown format. If
  they look good, they can be transferred to the regular `playlists` folder for
  permanent keeping.

To run the extraction process enter `npm run extract`

> Note: the extraction script is only meant for to migrate to this new system.
> Once all files have been migrated we can do away with this script entirely.
