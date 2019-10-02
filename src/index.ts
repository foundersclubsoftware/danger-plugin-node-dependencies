import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
import { TextDiff } from "../node_modules/danger/distribution/dsl/GitDSL"

declare const danger: DangerDSLType

export declare function warn(message: string): void
export declare function fail(message: string): void

interface PackageJSON {
  dependencies: PackageMap
  devDependencies: PackageMap
}

interface PackageMap {
  [key: string]: string
}

interface AddedPackages {
  dependencies: string[]
  devDependencies: string[]
}

interface NotifyOptions {
  dependencies?: boolean
  devDependencies?: boolean
}

const PACKAGEPHOBIA_BASE_URI = "https://packagephobia.now.sh/"

const addedDependenciesMessage = "##### Added dependencies"
const addedDevDependenciesMessage = "##### Added dev dependencies"

function getPackageAdditions(before: PackageMap, after: PackageMap): string[] {
  const beforePackages = Object.keys(before)
  const afterPackages = Object.keys(after)

  return afterPackages.filter(pkg => !beforePackages.includes(pkg))
}

function getAddedPackages(diff: TextDiff | null): AddedPackages | undefined {
  if (!diff) {
    return
  }

  const before: PackageJSON = JSON.parse(diff.before)
  const after: PackageJSON = JSON.parse(diff.after)

  return {
    dependencies: getPackageAdditions(before.dependencies, after.dependencies),
    devDependencies: getPackageAdditions(
      before.devDependencies,
      after.devDependencies
    ),
  }
}

function makeListItem(pkg: string): string {
  return (
    ` * ${pkg} [![install size](${PACKAGEPHOBIA_BASE_URI}badge?p=${pkg})]` +
    `(${PACKAGEPHOBIA_BASE_URI}result?p=${pkg})`
  )
}

function makePackageList(packages: string[]): string {
  return packages.reduce((list, dep) => list + "\n" + makeListItem(dep), "")
}

async function notifyAddedPackages(
  notify: (msg: string) => void,
  options?: NotifyOptions
): Promise<void> {
  if (!danger.git.modified_files.includes("package.json")) {
    return
  }

  const addedPackages = await danger.git
    .diffForFile("package.json")
    .then(getAddedPackages)

  if (!addedPackages) {
    return
  }

  if ((!options || options.dependencies) && addedPackages.dependencies.length) {
    notify(
      addedDependenciesMessage +
        ":" +
        makePackageList(addedPackages.dependencies)
    )
  }

  if (
    (!options || options.devDependencies) &&
    addedPackages.devDependencies.length
  ) {
    notify(
      addedDevDependenciesMessage +
        ":" +
        makePackageList(addedPackages.devDependencies)
    )
  }
}

export async function warnDependencies(options?: NotifyOptions): Promise<void> {
  await notifyAddedPackages(warn, options)
}

export async function failDependencies(options?: NotifyOptions): Promise<void> {
  await notifyAddedPackages(fail, options)
}
