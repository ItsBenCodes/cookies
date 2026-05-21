import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

const external = ['react', 'universal-cookie'];
const globals = {
  react: 'React',
  'universal-cookie': 'UniversalCookie',
};

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: './esm',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    plugins: [typescript({ outDir: './esm', declaration: false })],
    external,
  },
  {
    input: 'src/index.ts',
    output: {
      dir: './cjs',
      format: 'cjs',
    },
    plugins: [
      typescript({ outDir: './cjs' }),
      babel({ babelHelpers: 'bundled' }),
    ],
    external,
  },
  {
    input: 'src/index.ts',
    output: { file: 'esm/index.d.mts', format: 'esm' },
    external: ['universal-cookie', 'koa'],
    plugins: [dts()],
  },
];
