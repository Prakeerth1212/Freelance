import { execSync } from 'child_process'
import { exit } from 'process'
import { createRequire } from 'module'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const node = process.execPath
const tsc = require.resolve('typescript/bin/tsc')
const vitePkg = join(dirname(require.resolve('vite/package.json')), 'bin', 'vite.js')

try {
  execSync(`"${node}" "${tsc}" -b`, { stdio: 'inherit' })
} catch {
  console.error('TypeScript compilation failed')
  exit(1)
}

try {
  execSync(`"${node}" "${vitePkg}" build`, { stdio: 'inherit' })
} catch {
  console.error('Vite build failed')
  exit(1)
}
