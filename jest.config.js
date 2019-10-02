module.exports = {
    moduleFileExtensions: ["js", "json", "ts"],
    preset: "ts-jest",
    testEnvironment: "node",
    transform: { "^.+\\.ts$": "ts-jest", },
    transformIgnorePatterns: [
        "\\.snap$",
        "/node_modules/"
    ],
    resetMocks: true,
    roots: ["src/"]
}
