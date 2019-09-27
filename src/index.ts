import { danger, warn, TextDiff, message } from 'danger'

interface PackageJSON {
    dependencies: PackageMap
    devDependencies: PackageMap
}

interface PackageMap {
    [key: string]: string
}

function getPackageAdditions(before: PackageMap, after: PackageMap): string[] {
    const beforePackages = Object.keys(before)
    const afterPackages = Object.keys(after)

    return afterPackages.filter(pkg => !~beforePackages.indexOf(pkg))
}

function makePackageList(packages: string[]) {
    return packages.reduce((list, dep) => `${list}\n + ${dep}`, '')
}

function checkAddedPackages(diff: TextDiff | null): void {
    if (!diff) {
        return
    }

    const before: PackageJSON = JSON.parse(diff.before)
    const after: PackageJSON = JSON.parse(diff.after)

    const addedPackages = getPackageAdditions(before.dependencies, after.dependencies)
    const addedDevPackages = getPackageAdditions(before.devDependencies, after.devDependencies)

    if (addedPackages.length) {
        warn('Added dependencies:' + makePackageList(addedPackages))
    }

    if (addedDevPackages.length) {
        warn('Added dev dependencies:' + makePackageList(addedDevPackages))
    }
}

if (~danger.git.modified_files.indexOf('package.json')) {
    danger.git.diffForFile('package.json')
        .then(checkAddedPackages)
}
