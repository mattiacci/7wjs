# How To Develop

## First Time Setup

In the top-level directory, create a file named `config.js`: This will contain any server-specific information.

Example contents:

```
// Firebase server to connect to when running and developing.
window.FIREBASE_SERVER = 'https://foo.firebaseio.com/bar/';
// If you create assets for cards, etc. you can reference them here; otherwise, remove.
window.ASSET_URL_PREFIX = 'http://www.foo.foo/';
```

## Start Server

From the top-level directory, run `python -m SimpleHTTPServer` in the terminal.
The app will be accessible at http://localhost:8000/SevenWonders.html.
`Ctrl+C` kills the server.
