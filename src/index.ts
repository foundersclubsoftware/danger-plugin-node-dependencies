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

const addedDependenciesMessage = "Added dependencies"
const addedDevDependenciesMessage = "Added dev dependencies"

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

function makePackageList(packages: string[]): string {
  return packages.reduce((list, dep) => `${list}\n + ${dep}`, "")
}

async function notifyAddedPackages(
  notify: (msg: string) => void,
  types: {
    dependencies?: boolean
    devDependencies?: boolean
  }
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

  if (types.dependencies && addedPackages.dependencies.length) {
    notify(
      addedDependenciesMessage +
        ":" +
        makePackageList(addedPackages.dependencies)
    )
  }

  if (types.devDependencies && addedPackages.devDependencies.length) {
    notify(
      addedDevDependenciesMessage +
        ":" +
        makePackageList(addedPackages.devDependencies)
    )
  }
}

export function warnAddedDependencies(): void {
  notifyAddedPackages(warn, { dependencies: true })
}

export function failAddedDependencies(): void {
  notifyAddedPackages(fail, { dependencies: true })
}

export function warnAddedDevDependencies(): void {
  notifyAddedPackages(warn, { devDependencies: true })
}

export function failAddedDevDependencies(): void {
  notifyAddedPackages(fail, { devDependencies: true })
}

export function warnAllDependencies(): void {
  notifyAddedPackages(warn, { dependencies: true, devDependencies: true })
}

export function failAllDependencies(): void {
  notifyAddedPackages(fail, { dependencies: true, devDependencies: true })
}
