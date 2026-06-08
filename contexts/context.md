# 项目上下文

## 项目定位

Warp Key 是一个用于收集并展示 Cloudflare Warp+ key 的项目。当前主线是基于 Next.js 的 Web 应用，提供中英文页面、实时列表展示和纯文本 API；旧版 Go 实现保留用于私有化和兼容场景。

当前 Web 主线采用无状态设计：每次页面或 API 请求都会实时抓取上游公开页面，提取 `<code>` 标签中的 key，去重后返回结果，不写入数据库，也不更新本地 `data` 文件。

## 当前技术栈

- Next.js 16 App Router：页面、布局和 API route 位于 `app` 目录。
- React 19：页面和组件渲染。
- TypeScript：项目开启 `strict`，路径别名为 `@/*`。
- next-intl：通过 `app/[locale]`、`messages/*.json` 和 `i18n/*` 实现中英文路由与文案。
- Tailwind CSS 4、shadcn、本地 UI 组件：用于页面布局和基础组件。
- lucide-react：用于图标。
- undici：在配置代理环境变量时使用 `ProxyAgent` 抓取上游。
- pnpm：依赖管理和脚本入口。

## 目录职责

| 路径 | 说明 |
| --- | --- |
| `app/[locale]` | 国际化页面，包括首页、关于页和 API 文档页。 |
| `app/api/*/route.ts` | Next.js API route，提供 `full`、`lite`、`diff` 和 `cron` 接口。 |
| `components` | 页面组件和本地 UI 组件。 |
| `i18n` | next-intl 路由和请求配置。 |
| `messages` | 中英文文案 JSON。 |
| `lib/warp.ts` | 当前 Web 主线的核心抓取、提取、去重和列表生成逻辑。 |
| `docs/wiki` | 面向用户和仓库 Wiki 的完整文档。 |
| `specs` | 面向开发和 Agent 接手的规格文档。 |
| `legacy_backup` | 旧版 Go 实现、脚本和历史数据文件。 |
| `main.go` | 根目录保留的旧版 Go 源码，不参与 Next.js 构建。 |

## 核心数据链路

1. 页面或 API route 调用 `fetchLiveData()`。
2. `fetchLiveData()` 调用 `getAllKeys()`。
3. `getAllKeys()` 并发抓取 `lib/warp.ts` 中的 `SOURCES`。
4. `fetchKeysFromUrl()` 使用正则提取 `<code>key</code>`。
5. 使用 `Set` 对 key 去重。
6. `full` 最多返回 100 个 key。
7. `lite` 从 `full` 随机打乱后最多返回 15 个 key。
8. `lastUpdated` 使用当前请求生成结果时的 Unix 毫秒时间戳。

## 已实现接口

| 接口 | 访问控制 | 返回类型 | 说明 |
| --- | --- | --- | --- |
| `GET /api/full` | 公开 | `text/plain` | 返回完整列表，最多 100 行。 |
| `GET /api/lite` | 公开 | `text/plain` | 返回随机精简列表，最多 15 行。 |
| `GET /api/diff` | 公开 | `application/json` | 兼容接口；实时模式下不计算真实历史差异。 |
| `GET /api/cron` | `Authorization: Bearer <CRON_SECRET>` | `application/json` | 健康检查接口，会执行一次实时抓取，不持久化。 |

## 重要环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | 页面和文档示例使用的公开站点地址。 |
| `CRON_SECRET` | `/api/cron` 的 Bearer token。 |
| `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` | 上游 Telegram 访问受限时使用的代理。大小写变量均会尝试读取。 |

## 本地开发

```bash
pnpm install --frozen-lockfile
pnpm dev
```

常用校验：

```bash
pnpm lint
pnpm build
```

CI 使用 Node.js 22 和 pnpm 10。修改依赖后需要同步更新 `pnpm-lock.yaml`。

## 当前限制

- Web 主线不落盘，因此没有真实历史新增、移除或稳定性统计。
- Web 主线目前只做格式提取和去重，没有对 Cloudflare/Warp 服务端做远端可用性验证。
- 上游依赖 Telegram 公开页面结构；如果 `<code>` 结构变化，需要调整 `lib/warp.ts` 的 `PATTERN`。
- `/api/lite` 每次请求都会重新随机抽样，调用方不应假设结果稳定。
- 无数据库、队列或后台任务；Vercel Cron/GitHub Actions 目前主要用于健康检查。

## 文档入口

- 用户文档：`README_CN.md`、`README.md`。
- Wiki 文档：`docs/wiki/*.md`。
- 开发规格：`specs/*.md`。

当实现逻辑变化时，优先同步更新 `contexts/context.md` 和相关 `specs`，再按需更新 `docs/wiki` 与 README。
