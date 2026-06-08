# 架构规格

## 目标

本文档定义 Warp Key 当前 Next.js 主线的架构边界、数据流和维护约束。面向开发者和 Agent 接手使用，重点记录实现事实，而不是产品宣传描述。

## 架构原则

- Web 主线保持无状态：不依赖数据库、队列、对象存储或本地 `data` 文件。
- 数据按请求实时生成：页面和 API route 都调用 `lib/warp.ts` 中的同一套抓取逻辑。
- 上游来源集中配置：新增、移除或调整来源时优先修改 `SOURCES`。
- API 返回保持简单：公开 key 接口使用 `text/plain`，每行一个 key。
- 历史差异不伪造：没有持久化历史时，`/api/diff` 只能作为兼容接口返回当前 kept 列表和说明。

## 运行时模块

| 模块 | 责任 |
| --- | --- |
| `lib/warp.ts` | 抓取 Telegram 页面、提取 key、去重、生成 full/lite 列表。 |
| `app/[locale]/page.tsx` | 首页，服务端实时加载 full/lite 数据并展示。 |
| `app/[locale]/api/page.tsx` | API 使用说明页面，基于 `NEXT_PUBLIC_APP_URL` 生成示例地址。 |
| `app/[locale]/about/page.tsx` | 项目介绍页面。 |
| `app/api/full/route.ts` | 返回完整 key 列表。 |
| `app/api/lite/route.ts` | 返回随机精简 key 列表。 |
| `app/api/diff/route.ts` | 返回实时模式兼容 JSON。 |
| `app/api/cron/route.ts` | 受保护的健康检查接口。 |
| `i18n/*` | next-intl 路由和请求配置。 |
| `messages/*.json` | 页面中英文文案。 |

## 数据抓取规格

上游来源由 `lib/warp.ts` 的 `SOURCES` 常量维护。当前来源：

```text
https://t.me/s/warpplus
https://t.me/s/warppluscn
https://t.me/s/warpPlusHome
https://t.me/s/warp_veyke
```

提取规则：

```ts
/<code>([A-Za-z0-9-]+)<\/code>/g
```

处理规则：

- 单个来源抓取失败时返回空数组，不中断其他来源。
- 多来源并发抓取。
- 使用 `Set` 去重。
- 当前实现不主动验证 key 是否仍可用于 Warp+。
- 当前实现不保证 key 顺序稳定。

## 列表生成规格

| 字段 | 规则 |
| --- | --- |
| `full` | 当前请求去重后的 key 列表，最多 100 个。 |
| `lite` | 从 `full` 复制后使用 Fisher-Yates shuffle 打乱，最多 15 个。 |
| `lastUpdated` | 调用 `Date.now()` 生成的 Unix 毫秒时间戳。 |

如果抓取结果为空：

- 页面展示空状态。
- `/api/full` 和 `/api/lite` 返回 `404 No keys found.`。
- `/api/diff` 返回 `kept: []`。

## 缓存规格

API route 声明：

```ts
export const dynamic = 'force-dynamic';
```

`/api/full` 和 `/api/lite` 响应头：

```http
Content-Type: text/plain
Cache-Control: s-maxage=10, stale-while-revalidate=30
```

这表示服务端仍按动态 route 处理，但边缘层可以短时间缓存响应，降低 Telegram 上游压力。

## 代理规格

运行时按以下顺序读取代理环境变量：

```text
HTTPS_PROXY
https_proxy
HTTP_PROXY
http_proxy
ALL_PROXY
all_proxy
```

如果存在代理地址，抓取逻辑使用 `undici` 的 `ProxyAgent`。如果没有代理地址，则使用默认 `fetch`。

## 国际化规格

- 支持语言：`en`、`zh`。
- 默认语言：`en`。
- 受支持路由：`/`、`/en/*`、`/zh/*`。
- 新增页面可见文案时，必须同时更新 `messages/en.json` 和 `messages/zh.json`。
- 页面组件优先通过 `next-intl` 读取文案，不应把大量可见文案硬编码在组件里。

## 旧版 Go 边界

`legacy_backup` 和根目录 `main.go` 保留旧版 Go 实现。该实现会抓取来源、去重后写入：

```text
data/full
data/lite
```

当前 Next.js 主线不依赖这些文件。修改 Web 主线时不要误以为 `legacy_backup/data/*` 是生产数据源。

## 扩展建议

如果未来需要真实历史差异或稳定性统计，推荐新增持久化层，并明确以下契约：

- 当前抓取批次表或对象。
- key 状态和首次/最近出现时间。
- `/api/diff` 的基准窗口。
- 后台任务或 cron 的写入责任。

在新增持久化前，不应在 UI 或 API 文档中宣称已实现真实历史追踪。
