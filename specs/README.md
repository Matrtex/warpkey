# 规格文档索引

本目录用于记录面向开发和 Agent 接手的项目规格。这里的内容以当前代码实现为准，重点说明边界、契约和维护规则。

## 文档列表

| 文档 | 内容 |
| --- | --- |
| `architecture.md` | Next.js 主线架构、数据抓取、列表生成、缓存、代理和国际化约束。 |
| `api.md` | `/api/full`、`/api/lite`、`/api/diff`、`/api/cron` 的接口契约。 |
| `development-ops.md` | 本地开发、环境变量、CI、健康检查、Wiki 同步和许可证说明。 |

## 维护规则

- 修改核心实现后，优先更新 `contexts/context.md` 和本目录下对应规格。
- 修改用户文档或部署说明时，同步检查 `docs/wiki`。
- 修改用户可见文案时，同步检查 `messages/en.json` 和 `messages/zh.json`。
- 不要把未实现能力写成已实现事实，尤其是历史差异、远端有效性验证和持久化存储。
