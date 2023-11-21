import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';

const plugins = [
    typescript(),
    babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.ts'],
        presets: ['@babel/preset-env'],
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-function-sent',
            '@babel/plugin-proposal-export-namespace-from',
            '@babel/plugin-proposal-numeric-separator',
            '@babel/plugin-proposal-throw-expressions',
            '@babel/plugin-transform-object-assign',
        ],
    }),
];

export default [
    {
        input: './src/puller.ts',
        output: [
            { file: './dist/puller.js', format: 'esm' },
            { file: './dist/puller.common.js', format: 'cjs' },
        ],
        plugins,
    },
    {
        input: './src/index.iife.ts',
        output: [{ file: './dist/puller.iife.js', format: 'iife', name: 'Puller' }],
        plugins,
    },
];
