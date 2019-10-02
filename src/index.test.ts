import { warnDependencies, failDependencies } from "./index"

interface PackageList {
  dependencies: string[]
  devDependencies: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const global: any

function mockPackageDiff(before: PackageList, after: PackageList): void {
  // converts a list to an object in which the keys are the list items
  // i.e. [ 'pkgA', 'pkgB' ] -> { pkgA: 0, pkgB: 0 }
  const convert = (a: string[]): any =>
    a.reduce((o, k) => ({ ...o, [k]: 0 }), {})

  global.danger.git.diffForFile = jest.fn(async () => ({
    before: JSON.stringify({
      dependencies: convert(before.dependencies),
      devDependencies: convert(before.devDependencies),
    }),
    after: JSON.stringify({
      dependencies: convert(after.dependencies),
      devDependencies: convert(after.devDependencies),
    }),
  }))
}
/* eslint-enable */

beforeEach(() => {
  global.warn = jest.fn()
  global.fail = jest.fn()
  global.danger = {
    git: {
      modified_files: ["package.json"], // eslint-disable-line @typescript-eslint/camelcase
    },
  }
})

describe("Dependencies", () => {
  it("should detect all added dependencies", async () => {
    const before = {
      dependencies: ["pkg1"],
      devDependencies: ["pkgA"],
    }
    const after = {
      dependencies: ["pkg1", "pkg2", "pkg3"],
      devDependencies: ["pkgB"],
    }
    mockPackageDiff(before, after)

    await warnDependencies()
    expect(global.warn).toHaveBeenCalledTimes(2)

    const dependenciesMessage = global.warn.mock.calls[0][0]
    const devDependenciesMessage = global.warn.mock.calls[1][0]

    expect(dependenciesMessage).toMatchSnapshot()
    expect(devDependenciesMessage).toMatchSnapshot()
  })

  it("shouldn't detect removed dependencies", async () => {
    const before = {
      dependencies: ["pkg1"],
      devDependencies: ["pkgA", "pkgB"],
    }
    const after = {
      dependencies: [],
      devDependencies: [],
    }
    mockPackageDiff(before, after)

    await warnDependencies()
    expect(global.warn).not.toHaveBeenCalled()
  })
})

describe("Options", () => {
  it("should detect only dependencies when specified", async () => {
    const before = {
      dependencies: ["pkg1"],
      devDependencies: ["pkgA"],
    }
    const after = {
      dependencies: ["pkg1", "pkg2", "pkg3"],
      devDependencies: ["pkgB", "pkgC"],
    }
    mockPackageDiff(before, after)

    await failDependencies({ dependencies: true })
    expect(global.fail).toHaveBeenCalledTimes(1)

    const dependenciesMessage = global.fail.mock.calls[0][0]
    expect(dependenciesMessage).toMatchSnapshot()
  })

  it("should detect only dev dependencies when specified", async () => {
    const before = {
      dependencies: ["pkg1"],
      devDependencies: ["pkgA"],
    }
    const after = {
      dependencies: ["pkg1", "pkg2", "pkg3"],
      devDependencies: ["pkgB", "pkgC"],
    }
    mockPackageDiff(before, after)

    await failDependencies({ devDependencies: true })
    expect(global.fail).toHaveBeenCalledTimes(1)

    const devDependenciesMessage = global.fail.mock.calls[0][0]
    expect(devDependenciesMessage).toMatchSnapshot()
  })
})
