# danger-dependencies

> Keep dependencies as low as possible.

Warns or fails on new dependencies in `package.json`.

## Usage

#### Install
```
npm install --save-dev <TBD>
```

#### At a glance
```ts
// dangerfile.ts
import { warnDependencies, failDependencies } from 'danger-dependencies'

// Warn of all dependencies added since the last commit
warnDependencies()

// Warn on new dev dependencies, fail on new dependencies
warnDependencies({ devDependencies: true })
failDependencies({ dependencies: true })
```

#### Sample output

---
##### Added dependencies:
 * dotenv [![install size](https://packagephobia.now.sh/badge?p=dotenv)](https://packagephobia.now.sh/result?p=dotenv)
 * helmet [![install size](https://packagephobia.now.sh/badge?p=helmet)](https://packagephobia.now.sh/result?p=helmet)
##### Added dev dependencies:
 * @types/dotenv [![install size](https://packagephobia.now.sh/badge?p=@types/dotenv)](https://packagephobia.now.sh/result?p=@types/dotenv)
 * @types/helmet [![install size](https://packagephobia.now.sh/badge?p=@types/helmet)](https://packagephobia.now.sh/result?p=@types/helmet)
 * eslint [![install size](https://packagephobia.now.sh/badge?p=eslint)](https://packagephobia.now.sh/result?p=eslint)
---

## API

`danger-dependencies` exports two functions:
* `warnDependencies(options)`
* `failDependencies(options)`

The functions produce identical messages notifying you of dependencies added to `package.json`, but the former produces only warning messages, while the latter causes Danger to fail when added dependencies are found.

The options are passed in the form
```ts
{
    dependencies: boolean,
    devDependencies: boolean
}
```
If a key is omitted, it defaults to `false`. Passing no options will result in notification of all new dependencies.

## Credits
This project was created by [Levi Bostian](https://curiosityio.com/) and [Oliver Emery](https://github.com/thrymgjol).

Dependency size badges in ouput messages are provided by [Package Phobia](https://packagephobia.now.sh/).
