# GitHub Actions

本项目提供三个 workflow，用于构建校验、定时健康检查和 Wiki 同步。

## 持续集成

文件：

```text
.github/workflows/ci.yml
```

触发方式：

- push 到 `main`
- 针对 `main` 的 pull request
- 手动运行 `workflow_dispatch`

执行内容：

1. 检出代码。
2. 安装 pnpm 10 和 Node.js 22。
3. 执行 `pnpm install --frozen-lockfile`。
4. 执行 `pnpm lint`。
5. 执行 `pnpm build`。

CI 会设置以下临时环境变量，保证构建阶段不会因为缺少公开地址或 cron secret 失败：

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=ci-cron-secret
```

## 定时健康检查

文件：

```text
.github/workflows/cron-healthcheck.yml
```

触发方式：

- 每小时运行一次。
- 支持手动运行，并可临时输入 `app_url`。

需要配置：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `APP_URL` | Repository variable 或 secret | 已部署站点地址，例如 `https://your-app.vercel.app` |
| `CRON_SECRET` | Repository secret | 与部署环境中的 `CRON_SECRET` 保持一致 |

执行逻辑：

1. 读取 `APP_URL` 和 `CRON_SECRET`。
2. 请求 `${APP_URL}/api/cron`。
3. 校验 JSON 中的 `success` 字段。
4. 输出 full/lite 数量，便于在日志中快速判断抓取结果。

如果没有配置 `APP_URL` 或 `CRON_SECRET`，workflow 会失败并提示需要补充配置。

## 同步 Wiki 文档

文件：

```text
.github/workflows/sync-wiki.yml
```

触发方式：

- push 修改 `docs/wiki/**` 时自动运行。
- 手动运行 `workflow_dispatch`。

执行逻辑：

1. 检查 GitHub Wiki 仓库是否存在。
2. 如果未启用 Wiki，输出提示并跳过。
3. 如果已启用 Wiki，克隆 `${owner}/${repo}.wiki.git`。
4. 将 `docs/wiki` 的内容复制到 Wiki 仓库。
5. 有变更时提交并推送。

提交信息：

```text
docs: 同步项目 Wiki
```

## GitHub 配置位置

Repository variables：

```text
Settings -> Secrets and variables -> Actions -> Variables
```

Repository secrets：

```text
Settings -> Secrets and variables -> Actions -> Secrets
```

推荐配置：

```text
APP_URL=https://your-app.vercel.app
CRON_SECRET=<部署时使用的同一个值>
```

## 本地推送代理

如果本地网络需要走 `10808` 代理推送，可以只对单次 push 生效：

```bash
git -c http.proxy=http://127.0.0.1:10808 \
  -c https.proxy=http://127.0.0.1:10808 \
  push origin main
```

也可以在当前仓库设置：

```bash
git config http.proxy http://127.0.0.1:10808
git config https.proxy http://127.0.0.1:10808
```

如果使用仓库级配置，推送完成后可按需清理：

```bash
git config --unset http.proxy
git config --unset https.proxy
```

## 权限说明

- `ci.yml` 只需要 `contents: read`。
- `cron-healthcheck.yml` 只需要 `contents: read`。
- `sync-wiki.yml` 需要 `contents: write`，用于推送 GitHub Wiki 仓库。
