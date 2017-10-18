module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "no-var": 2,
        "indent": [
            "error",
            4
        ],
        "no-unused-vars": [
            "warn"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "complexity": [
            2,
            9
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};