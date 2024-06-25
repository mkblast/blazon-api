import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "no-unused-vars": "error",
            "no-undef": "error",
            "indent": [
                "error",
                4
            ],
            "linebreak-style": [
                "error",
                "unix"
            ],
            "quotes": [
                "error",
                "double"
            ],
            "semi": [
                "error",
                "always"
            ]
        }
    }
];
