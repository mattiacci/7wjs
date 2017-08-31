# How To Develop

## First Time Setup

### Install NodeJS 6.x

On Debian or Ubuntu-based Linux distros, including
[Ubuntu on Windows 10 via WSL](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide#for-anniversary-update-and-creators-update-install-using-lxrun),
you can do this by running:
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y build-essential nodejs
```

You can find
[instructions for other operating systems](https://nodejs.org/en/download/package-manager/)
at nodejs.org.

### Install Project Dependencies

After cloning the repo and installing NodeJS, you can install everything
necessary to build and develop by running:

```
npm install
```

### Config

Once that is complete, create a file named `.env` in the project's top-level
directory, which holds environment variables used by the app.

```
// Firebase server to connect to when running and developing. You can get this
// JSON from https://console.firebase.google.com/project/<project-name>/overview
REACT_APP_FIREBASE_CONFIG='{"apiKey":"","databaseURL":"","projectId":"", ... }'
// If you create assets for cards, etc. you can reference them here.
REACT_APP_ASSET_URL_PREFIX='http://www.foo.foo/'
```

Note: `.env` file values are not escaped for you, so wrap any values with
whitespace in quotes and escape any special characters (for bash).

## Run and Test

From the project's top-level directory, you can run the following commands:

```
npm start       // Starts a dev server at http://localhost:3000. Ctrl+C to stop.
npm test        // Runs tests, of course.
```

## Build and Deploy

```
npm run build
rsync -av --chmod=D2775,F664 build/ <user>@<domain>:<absolute-path>/
```

Note: `npm run build` uses your `.env` file(s) to build, so make sure you
understand how
[dotenv environment variables](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-development-environment-variables-in-env)
work before building (or you might, say, point production at your development
Firebase instance).

## Project Dependencies and Documentation

This project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).
Many of your questions can be answered by looking at the
[Create React App guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
