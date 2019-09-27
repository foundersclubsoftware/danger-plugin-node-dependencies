import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
import { TextDiff } from "../node_modules/danger/distribution/dsl/GitDSL"

declare var danger: DangerDSLType

export declare function warn(message: string): void
export declare function fail(message: string): void

interface PackageJSON {
  dependencies: PackageMap
  devDependencies: PackageMap
}

interface PackageMap {
  [key: string]: string
}

const addedPackages: string[] = []
const addedDevPackages: string[] = []

const addedDependenciesMessage = "Added dependencies"
const addedDevDependenciesMessage = "Added dev dependencies"

function getPackageAdditions(before: PackageMap, after: PackageMap): string[] {
  const beforePackages = Object.keys(before)
  const afterPackages = Object.keys(after)

  return afterPackages.filter(pkg => !beforePackages.includes(pkg))
}

function populateAddedPackages(diff: TextDiff | null): void {
  if (!diff) {
    return
  }

  const before: PackageJSON = JSON.parse(diff.before)
  const after: PackageJSON = JSON.parse(diff.after)

  addedPackages.push(
    ...getPackageAdditions(before.dependencies, after.dependencies)
  )
  addedDevPackages.push(
    ...getPackageAdditions(before.devDependencies, after.devDependencies)
  )
}

if (danger.git.modified_files.includes("package.json")) {
  danger.git.diffForFile("package.json").then(populateAddedPackages)
}

function makePackageList(packages: string[]) {
  return packages.reduce((list, dep) => `${list}\n + ${dep}`, "")
}

function notifyAddedPackages(
  notifyFunction: (msg: string) => void,
  message: string,
  packageList: string[]
) {
  if (packageList.length) {
    notifyFunction(message + ":" + makePackageList(packageList))
  }
}

export function warnAddedDependencies() {
  notifyAddedPackages(warn, addedDependenciesMessage, addedPackages)
}

export function failAddedDependencies() {
  notifyAddedPackages(fail, addedDependenciesMessage, addedPackages)
}

export function warnAddedDevDependencies() {
  notifyAddedPackages(warn, addedDevDependenciesMessage, addedDevPackages)
}

export function failAddedDevDependencies() {
  notifyAddedPackages(fail, addedDevDependenciesMessage, addedDevPackages)
}
