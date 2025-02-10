# TODO

1. Replace old `head` with new `head` element, taking care to retain proper
   title (matches the file name)
2. Replace entire `table` element in the old page with `#navbar-container`
   element from new page.

- Rename `div` of #navbar-container to `header` for semantic clarity
- Stash prev + next links for the next step...

3. Append prev+next links section after `header` (perhaps using an `aside`
   element for semantic clarity)
4. Everything after the unnamed prev+next section in the new page is not wrapped
   in a single element and has custom styles for various content while the old
   page example has everything in a single `p` element (which is unsemantic, but
   makes it easy to identify what should be replaced).

So I'm not 100% sure what you would like for step #4, but I'm guessing we can
just leave the contents of `<p class="playlist">` as is, though I suggest
renaming the element to `<main class="playlist">` so in the end you have more
structured document:

```html
<head>
  <body>
    <header>...</header>
    <!-- or could be <section> -->
    <aside>...</aside>
    <main>...</main>
  </body>
</head>
```

5. Append script to enable keyboard navigation of prev+next buttons

Visual representation of the above notes:

```html
<!-- OLD -->
<!-- Replace with new head  -->
<head>
  <!-- Retain this, and prepend `m50 | `  -->
  <title>2023.12.29 etc</title>
</head>

<!-- Copy bgcolor below into style declaration -->
<body bgcolor=".." various-link-colors="...">
  <!-- 1. Replace entire table with <div id="navbar-container"> "template"  -->
  <!-- Note: "div" should be replaced with proper `<header />` tag -->
  <!-- 2. Ensure we retain the links for previous + next playlists -->
  <table>
    ...
  </table>

  <!-- Retain contents, rename element to <main class="playlist">  -->
  <p class="playlist">...</p>

  <!-- Append script to enable keyboard navigation of prev/next buttons -->
</body>
```

```html
<aside>
  <div class="container mt-4 mb-4">
    <div class="d-flex justify-content-between">
      <div>
        <a
          class="btn btn-outline-primary"
          href="{{prevPlaylistLink}}"
          target="_self"
        >
          Previous Playlist
        </a>
      </div>
      <div>
        <a
          class="btn btn-outline-primary"
          href="{{nextPlaylistLink}}"
          target="_self"
        >
          Next Playlist
        </a>
      </div>
    </div>
  </div>
</aside>
<main>{{playlist}}</main>
```
# m50.net
