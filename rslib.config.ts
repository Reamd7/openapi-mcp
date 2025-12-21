import { defineConfig } from '@rslib/core';

export default defineConfig({
    lib: [
        { format: 'cjs', syntax: 'es2021', bundle: true, autoExternal: false,  },
    ],
    output: {
        target: "node",
        minify: true
    }
});