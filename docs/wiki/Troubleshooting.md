# 故障排查

## `/api/full` 返回 `No keys found.`

常见原因：

- 部署环境无法访问 Telegram 公开页面。
- 上游页面结构变化，当前正则无法提取 key。
- 代理环境变量未配置或代理不可用。
- 上游临时限流或返回异常页面。

排查步骤：

```bash
curl -I https://t.me/s/warpplus
curl -sL https://your-app.vercel.app/api/full
```

如果本地可访问、服务器不可访问，优先配置：

```text
HTTPS_PROXY
HTTP_PROXY
ALL_PROXY
```

## `/api/cron` 返回 `401 Unauthorized`

原因是请求头不匹配：

```http
Authorization: Bearer <CRON_SECRET>
```

确认以下位置使用同一个值：

- Vercel Environment Variables 中的 `CRON_SECRET`。
- GitHub Actions Secrets 中的 `CRON_SECRET`。
- 手动 curl 命令中的 `CRON_SECRET`。

验证命令：

```bash
curl -i \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-app.vercel.app/api/cron
```

## GitHub Actions 构建失败

先查看失败步骤：

- `pnpm install --frozen-lockfile` 失败：检查 `pnpm-lock.yaml` 是否和 `package.json` 同步。
- `pnpm lint` 失败：按日志修复 ESLint 问题。
- `pnpm build` 失败：检查 Next.js 编译错误、类型错误或环境变量读取。

本地复现：

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

## 定时健康检查失败

检查 GitHub Actions 配置：

```text
APP_URL=https://your-app.vercel.app
CRON_SECRET=<部署环境同值>
```

检查部署站点：

```bash
curl -i https://your-app.vercel.app
curl -i -H "Authorization: Bearer ${CRON_SECRET}" https://your-app.vercel.app/api/cron
```

如果接口可手动访问但 Action 失败，查看 Action 日志中的 HTTP 状态码和响应体。

## Wiki 同步被跳过

`sync-wiki.yml` 会先检测 `${owner}/${repo}.wiki.git` 是否存在。如果仓库没有启用 GitHub Wiki，会输出提示并正常跳过。

处理方式：

1. 打开 GitHub 仓库页面。
2. 进入 `Settings -> General -> Features`。
3. 勾选 `Wikis`。
4. 手动运行 `同步 Wiki 文档` workflow。

## Wiki 同步推送失败

可能原因：

- 仓库 Actions 权限不允许写入。
- Wiki 仓库未启用。
- 默认 `GITHUB_TOKEN` 权限受限。

检查：

```text
Settings -> Actions -> General -> Workflow permissions
```

建议选择：

```text
Read and write permissions
```

## 本地 push 失败

如果是网络问题，可使用单次代理推送：

```bash
git -c http.proxy=http://127.0.0.1:10808 \
  -c https.proxy=http://127.0.0.1:10808 \
  push origin main
```

如果是认证问题，确认 remote、token 或 SSH key：

```bash
git remote -v
git status --short --branch
```

## 页面显示时间或文案异常

项目使用 `next-intl` 和 `messages` 文案文件。优先检查：

```text
messages/zh.json
messages/en.json
i18n/routing.ts
i18n/request.ts
```

新增文案时，中英文文件都应补齐同名 key。
