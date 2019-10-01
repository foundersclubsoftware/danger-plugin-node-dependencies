module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    preset: "ts-jest",
    testEnvironment: "node",
    transform: { "^.+\\.ts$": "ts-jest", },
    transformIgnorePatterns: ["/node_modules/"],
    resetMocks: true,
    roots: ["src/"]
}
