// 发布脚本：更新版本号 -> 构建 -> 将 dist 备份到 release/<版本号>/
// 用法：
//   pnpm build:release            自动递增当前版本最后一段（1.1 -> 1.2）
//   pnpm build:release 2.0        指定新版本号
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, rmSync, cpSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(root, 'public/manifest.json')
const pkgPath = resolve(root, 'package.json')
const distDir = resolve(root, 'dist')

/** 递增版本号最后一段，例如 1.1 -> 1.2、1.0.3 -> 1.0.4 */
function bumpVersion(version) {
  const parts = version.split('.')
  const last = Number(parts[parts.length - 1])
  if (Number.isNaN(last)) throw new Error(`无法解析版本号：${version}`)
  parts[parts.length - 1] = String(last + 1)
  return parts.join('.')
}

/** 读取 JSON 文件 */
function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

/** 写回 JSON 文件（保留 2 空格缩进 + 结尾换行） */
function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

const manifest = readJson(manifestPath)
const nextVersion = process.argv[2]?.trim() || bumpVersion(manifest.version)

console.log(`版本号：${manifest.version} -> ${nextVersion}`)

// 1. 同步更新 manifest.json 与 package.json 的版本号
manifest.version = nextVersion
writeJson(manifestPath, manifest)

const pkg = readJson(pkgPath)
pkg.version = nextVersion
writeJson(pkgPath, pkg)

// 2. 执行构建
console.log('执行构建 ...')
execSync('pnpm build', { cwd: root, stdio: 'inherit' })

// 3. 将构建产物备份到 release/<版本号>/
const releaseDir = resolve(root, 'release', nextVersion)
if (existsSync(releaseDir)) rmSync(releaseDir, { recursive: true, force: true })
cpSync(distDir, releaseDir, { recursive: true })

console.log(`已备份构建产物到 release/${nextVersion}/`)
