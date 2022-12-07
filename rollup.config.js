import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import importAssets from 'rollup-plugin-import-assets';
import scss from 'rollup-plugin-scss';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import { name } from './plugin.json';

export default defineConfig({
  input: './src/index.tsx',
  plugins: [
    commonjs(),
    nodePolyfills(),
    nodeResolve(),
    typescript(),
    json({ compact: true, namedExports: false }),
    scss({
      output: false,
      sourceMap: false,
      include: ['src/styles/**/*.scss', 'src/styles/**/*.sass'],
      watch: 'src/styles',
      sass: require('sass'),
    }),
    replace({
      preventAssignment: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.ROLLUP_ENV': JSON.stringify(process.env.ROLLUP_ENV),
    }),
    importAssets({
      publicPath: `http://127.0.0.1:1337/plugins/${name}/`
    })
  ],
  context: 'window',
  external: ['react', 'react-dom'],
  output: {
    file: 'dist/index.js',
    globals: {
      react: 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
    },
    format: 'iife',
    exports: 'default',
  },
});
