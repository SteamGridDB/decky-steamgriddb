import { readFileSync } from 'fs';
import { join } from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import importAssets from 'rollup-plugin-import-assets';
import { defineConfig } from 'rollup';
import scss from 'rollup-plugin-scss';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import externalGlobals from 'rollup-plugin-external-globals';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';
import * as sass from 'sass';

const manifest = JSON.parse(readFileSync(join('.', 'plugin.json'), 'utf-8'));

export default defineConfig({
  input: './src/index.tsx',
  plugins: [
    del({ targets: './dist/*', force: true }),
    json({ compact: true }),
    typescript({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
    commonjs(),
    nodePolyfills(),
    nodeResolve({
      browser: true,
    }),
    scss({
      output: false,
      sourceMap: false,
      include: ['src/styles/**/*.scss', 'src/styles/**/*.sass'],
      watch: 'src/styles',
      sass: sass,
    }),
    externalGlobals({
      react: 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
      '@decky/ui': 'DFL',
      '@decky/manifest': JSON.stringify(manifest),
    }),
    replace({
      preventAssignment: false,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.ROLLUP_ENV': JSON.stringify(process.env.ROLLUP_ENV),
    }),
    importAssets({
      publicPath: `http://127.0.0.1:1337/plugins/${manifest.name}/`,
      include:[
        /\.gif$/i,
        /\.jpg$/i,
        /\.png$/i,
        /\.svg$/i,
        /\.webm$/i,
        /\.webp$/i,
        /\.mp4$/i,
      ],
    }),
  ],
  context: 'window',
  external: ['react', 'react-dom', '@decky/ui'],
  treeshake: {
    // Assume all external modules have imports with side effects (the default) while allowing decky libraries to treeshake
    pureExternalImports: {
      pure: ['@decky/ui', '@decky/api'],
    },
    preset: 'smallest',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    sourcemapPathTransform: (relativeSourcePath) => relativeSourcePath.replace(/^\.\.\//, `decky://decky/plugin/${encodeURIComponent(manifest.name)}/`),
    exports: 'default',
  },
});
