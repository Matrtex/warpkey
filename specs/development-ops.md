# 开发与运维规格

## 本地环境

推荐版本：

| 工具 | 版本 |
| --- | --- |
| Node.js | 22 |
| pnpm | 10 |
| TypeScript | 使用仓库锁定依赖 |

安装依赖：

```bash
pnpm install --frozen-lockfile
```

启动开发服务：

```bash
pnpm dev
```

默认地址：

```text
http://localhost:3000
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Next.js 开发服务。 |
| `pnpm lint` | 运行 ESLint。 |
| `pnpm build` | 构建生产版本。 |
| `pnpm start` | 启动生产构建后的服务。 |

提交前建议至少运行：

```bash
pnpm lint
pnpm build
```

纯文档变更可按风险判断是否跳过构建，但需要检查 Markdown 链接和文件路径是否准确。

## 环境变量

| 变量 | 场景 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | 页面/API 文档 | 公开站点地址，例如 `https://your-app.vercel.app`。 |
| `CRON_SECRET` | `/api/cron` | Bearer token，不能提交到仓库。 |
| `HTTPS_PROXY` | 上游抓取 | HTTPS 代理地址。 |
| `HTTP_PROXY` | 上游抓取 | HTTP 代理地址。 |
| `ALL_PROXY` | 上游抓取 | 通用代理地址。 |

PowerShell 代理示例：

```powershell
$env:HTTPS_PROXY = "http://127.0.0.1:10808"
pnpm dev
```

Bash 代理示例：

```bash
HTTPS_PROXY=http://127.0.0.1:10808 pnpm dev
```

## CI 规格

`.github/workflows/ci.yml`：

- 触发：push 到 `main`、针对 `main` 的 pull request、手动运行。
- 环境：Ubuntu latest、Node.js 22、pnpm 10。
- 步骤：安装依赖、`pnpm lint`、`pnpm build`。
- 构建环境变量：

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=ci-cron-secret
```

`.github/workflows/codeql.yml`：

- 触发：push、pull request、每周计划任务、手动运行。
- 语言：`javascript-typescript`。
- 目的：执行 CodeQL 安全分析。

## 健康检查规格

`.github/workflows/cron-healthcheck.yml`：

- 计划任务：每小时第 17 分钟执行。
- 手动运行时可通过 `app_url` 临时覆盖部署地址。
- 优先读取 `vars.APP_URL` 或 `secrets.APP_URL`。
- 如果配置了 `CRON_SECRET`，调用 `/api/cron`。
- 如果未配置 `CRON_SECRET`，退化检查公开 `/api/full`。
- 默认部署地址兜底为 `https://warp-tool.vercel.app`。

推荐 GitHub 配置：

```text
APP_URL=https://your-app.vercel.app
CRON_SECRET=<与部署环境相同的值>
```

## Wiki 同步规格

`.github/workflows/sync-wiki.yml`：

- 修改 `docs/wiki/**` 或 workflow 文件并 push 到 `main` 时触发。
- 也支持手动运行。
- 会先检测 GitHub Wiki 仓库是否存在。
- Wiki 未启用时跳过，不应视为构建失败。
- 有变更时提交信息为 `docs: 同步项目 Wiki`。

## 文档维护规则

修改实现时同步检查：

| 改动类型 | 需要检查的文档 |
| --- | --- |
| 数据抓取逻辑 | `contexts/context.md`、`specs/architecture.md`、`docs/wiki/Architecture.md` |
| API 返回格式 | `specs/api.md`、`docs/wiki/API.md`、`app/[locale]/api/page.tsx` |
| 部署变量或流程 | `specs/development-ops.md`、`docs/wiki/Deployment.md`、`docs/wiki/GitHub-Actions.md` |
| 用户可见文案 | `messages/en.json`、`messages/zh.json` |
| README 对外描述 | `README.md`、`README_CN.md` |

## 代码风格约束

- TypeScript 路径别名使用 `@/*`。
- UI 组件优先复用 `components/ui` 和现有组件。
- 新增图标优先使用 `lucide-react`。
- 新增页面应走 `app/[locale]` 国际化路由。
- 新增用户可见文案应进入 `messages`，避免只写在单一语言组件里。
- 新增代码注释使用中文，且只在逻辑不直观时添加。

## 许可证

项目根目录使用 MIT License，详见 `LICENSE`。

旧版 Go 目录中的 `legacy_backup/LICENSE` 是历史实现保留文件。维护项目许可证时，应优先以根目录 `LICENSE` 作为当前仓库对外许可证入口。
