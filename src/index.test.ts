import { warnDependencies, failDependencies } from "./index"

interface PackageList {
  dependencies: string[]
  devDependencies: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const global: any

function mockPackageDiff(before: PackageList, after: PackageList): void {
  // converts a list to an object in which the keys are the list items
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
    mockPackageDiff(
      {
        dependencies: ["pkg1"],
        devDependencies: ["pkgA"],
      },
      {
        dependencies: ["pkg1", "pkg2", "pkg3"],
        devDependencies: ["pkgB"],
      }
    )

    await warnDependencies()
    expect(global.warn).toHaveBeenCalledWith(expect.stringContaining("pkg2"))
    expect(global.warn).toHaveBeenCalledWith(expect.stringContaining("pkg3"))
    expect(global.warn).toHaveBeenCalledWith(expect.stringContaining("pkgB"))
  })

  it("shouldn't detect removed dependencies", async () => {
    mockPackageDiff(
      {
        dependencies: ["pkg1"],
        devDependencies: ["pkgA", "pkgB"],
      },
      {
        dependencies: [],
        devDependencies: [],
      }
    )

    await warnDependencies()
    expect(global.warn).not.toHaveBeenCalled()
  })
})

describe("Options", () => {
  it("should detect only dependencies when specified", async () => {
    mockPackageDiff(
      {
        dependencies: ["pkg1"],
        devDependencies: ["pkgA"],
      },
      {
        dependencies: ["pkg1", "pkg2", "pkg3"],
        devDependencies: ["pkgB", "pkgC"],
      }
    )

    await failDependencies({ dependencies: true })
    expect(global.fail).toHaveBeenCalledWith(expect.stringContaining("pkg2"))
    expect(global.fail).toHaveBeenCalledWith(expect.stringContaining("pkg3"))
    expect(global.fail).not.toHaveBeenCalledWith(
      expect.stringContaining("pkgB")
    )
    expect(global.fail).not.toHaveBeenCalledWith(
      expect.stringContaining("pkgC")
    )
  })

  it("should detect only dev dependencies when specified", async () => {
    mockPackageDiff(
      {
        dependencies: ["pkg1"],
        devDependencies: ["pkgA"],
      },
      {
        dependencies: ["pkg1", "pkg2", "pkg3"],
        devDependencies: ["pkgB", "pkgC"],
      }
    )

    await failDependencies({ devDependencies: true })
    expect(global.fail).not.toHaveBeenCalledWith(
      expect.stringContaining("pkg2")
    )
    expect(global.fail).not.toHaveBeenCalledWith(
      expect.stringContaining("pkg3")
    )
    expect(global.fail).toHaveBeenCalledWith(expect.stringContaining("pkgB"))
    expect(global.fail).toHaveBeenCalledWith(expect.stringContaining("pkgC"))
  })
})
