import pluginTester from 'babel-plugin-tester';
import { join } from 'path';
// @ts-ignore
import plugin from '../lib';

pluginTester({
  pluginName: 'babel-plugin-stub',
  plugin: plugin,
  fixtures: join(__dirname, 'fixtures'),
  snapshot: true,
  endOfLine: 'preserve',
});
