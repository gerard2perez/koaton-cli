![Koaton](/koaton-cli.png)

[![Build Status](https://img.shields.io/travis/gerard2p/koaton-cli/master.svg?style=flat-square)](https://travis-ci.org/gerard2p/koaton-cli)[![Dependency Status](https://david-dm.org/gerard2p/koaton-cli.svg?style=flat-square)](https://david-dm.org/gerard2p/koaton-cli)![PRs Welcome](https://img.shields.io/badge/PRs%20🔀-Welcome-brightgreen.svg?style=flat-square)

[![Code Climate](https://codeclimate.com/github/gerard2p/koaton-cli/badges/gpa.svg?style=flat-square)](https://codeclimate.com/github/gerard2p/koaton-cli?style=flat-square) [![Test Coverage](https://codeclimate.com/github/gerard2p/koaton-cli/badges/coverage.svg?style=flat-square)](https://codeclimate.com/github/gerard2p/koaton-cli/coverage) [![Issue Count](https://codeclimate.com/github/gerard2p/koaton-cli/badges/issue_count.svg?style=flat-square)](https://codeclimate.com/github/gerard2p/koaton-cli)


![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg?style=flat-square)](https://github.com/JedWatson/happiness)

Koaton is a CLI tool that allow you to easily create and manage your [Koaton](https://github.com/gerard2p/koaton) projects.

  The Latest Version
  ------------------
 [![NPM Version](http://img.shields.io/npm/v/koaton-cli.svg?style=flat-square)](https://www.npmjs.org/package/koaton-cli)

## Documentation

```bash
koaton --help
```
Or
> [Commands List](commands.md)

Documentation will be avaliable at:
<http://www.koaton.io/cli/>

## Installation

  Will be:

```sh
npm i koaton-cli -g
```

Other programs you may need:

```sh
npm i forever -g
npm i bower -g
npm i ember-cli -g
```

## Usage

```zsh
koaton new myfirstapp
cd myfirstapp
koaton ember restapp -n -m /panel
koaton model user "active:number name email password note:text created:date" -e restapp -r

koaton serve -b
```

## Do it with style

**CSS, LESS and SASS/SCSS**

Every Framework should include an efficient way of working with *css*, well, i'm working to make it as easy as posible at the moment, so, koaton has a way to work with css pre-processors.

```zsh
koaton build
```

This commands reads the file **/config/bundle.js** and outputs the content in **/public/css/**

The bundle.js files is a exports a json object which contains an array of files:

```
    "dest_file":[ARRAY_OF_SOURCES]
```

** *dest_file* ** can be defined as a javascript or css file.
** *ARRAY_OF_SOURCES* ** can contain a glob patter if we're defined a javascript file or any css/less/sass/scss files if we're defining a css file.

### Develop easily

All the files are automatically watched and rebuild if we're running in the **development** environment.
Any file which if defined in the bundle file would be watched as well as any file which is required in the files defined in the bundle.js.

Koaton uses livereload, so, after a source file is changed, Koaton would rebuild the *dest_file* and will notify the browser to reload the file.

### Fast Fast Fast

Debugin a UI can be hard if we don't have the right tools, that's why Koaton makes SourceMaps of all the bundle files (javascript or css).

SourceMaps will be always be built in **development** environment, but **not** in **production** environment (like it should be).

> Rigth now I don't know hot to concat the SourceMaps for css files so instead of building one single file a file for every element in *ARRAY_OF_SOURCES* would e built **ONLY IN DEVELOPMENT ENVIROMENT** *and for LESS/SASS/SCSS/CSS files*, javascript its fine.

## Contributors

1. Gerardo Pérez Pérez <gerard2perez@outllok.com>

## Licensing
Read [LICENCE.md](LICENCE.md)
