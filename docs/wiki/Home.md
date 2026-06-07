# Warp Key Wiki

本 Wiki 记录 Warp Key 项目的运行方式、部署步骤、API 用法、GitHub Actions 自动化和常见故障处理。当前主线实现是基于 Next.js 的 Web 应用，旧版 Go 实现保留在 `legacy_backup` 目录中，适合私有化或离线场景继续使用。

## 项目定位

Warp Key 用于从公开来源实时收集 Cloudflare Warp+ key，去重后提供 Web 页面和纯文本 API。项目不依赖数据库，主线服务在每次请求时实时抓取数据，并按接口用途输出完整列表或精简列表。

## 快速入口

| 页面 | 内容 |
| --- | --- |
| [架构说明](Architecture.md) | 数据流、目录结构、运行时行为、代理支持 |
| [部署指南](Deployment.md) | Vercel、本地 Next.js、私有服务器和旧版 Go 部署 |
| [API 文档](API.md) | `/api/full`、`/api/lite`、`/api/diff`、`/api/cron` |
| [GitHub Actions](GitHub-Actions.md) | CI、定时健康检查、Wiki 同步和推送代理 |
| [旧版 Go 实现](Legacy-Go.md) | legacy 目录、构建、运行、迁移建议 |
| [故障排查](Troubleshooting.md) | 抓取失败、cron 鉴权、构建失败、Wiki 同步问题 |

## 当前能力

- Web UI：支持中文和英文界面，展示实时拉取的 full/lite 列表。
- API：提供纯文本 key 列表，便于脚本、客户端或订阅工具集成。
- 实时抓取：请求时从 Telegram 公开页面拉取，去重后返回结果。
- 代理支持：运行时读取 `HTTPS_PROXY`、`HTTP_PROXY`、`ALL_PROXY` 等环境变量。
- 自动化：GitHub Actions 覆盖 lint/build、cron 健康检查和 Wiki 同步。
- 兼容实现：保留 Go 版本，适合需要本地落盘、脚本定时更新的场景。

## 目录结构

```text
app/                  Next.js App Router 页面和 API route
components/           UI 组件和通用按钮
i18n/                 next-intl 路由和请求配置
lib/warp.ts           Warp key 来源抓取、去重和列表生成
messages/             中文、英文翻译文案
legacy_backup/        旧版 Go 实现与历史数据
docs/wiki/            仓库内 Wiki 文档，可同步到 GitHub Wiki
.github/workflows/   GitHub Actions 自动化流程
```

## 推荐维护流程

1. 修改业务代码或文档。
2. 本地运行 `pnpm lint` 和 `pnpm build`。
3. 更新 `docs/wiki` 中对应页面。
4. 推送后让 `持续集成` workflow 自动校验。
5. 需要发布 Wiki 时运行 `同步 Wiki 文档` workflow。

## 运行前提

- Node.js 22 或兼容版本。
- pnpm 10。
- 访问 Telegram 公开页面的网络能力；如果服务器出口受限，需要配置代理环境变量。
- 如果启用 `/api/cron` 健康检查，需要设置 `CRON_SECRET`。
