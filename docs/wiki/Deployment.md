# 部署指南

## 方式一：Vercel 部署

Vercel 是主线 Next.js 应用的推荐部署方式。

### 步骤

1. Fork 或导入本仓库。
2. 在 Vercel 中选择该仓库并创建项目。
3. Framework Preset 选择 `Next.js`。
4. Install Command 使用：

```bash
pnpm install --frozen-lockfile
```

5. Build Command 使用：

```bash
pnpm build
```

6. 配置环境变量。

### 必需或推荐环境变量

| 变量 | 是否必需 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | 推荐 | 页面和文档示例中使用的公开站点地址 |
| `CRON_SECRET` | 推荐 | 保护 `/api/cron` 健康检查接口 |
| `HTTPS_PROXY` | 按需 | 上游 Telegram 访问受限时使用 |
| `HTTP_PROXY` | 按需 | 上游 Telegram 访问受限时使用 |
| `ALL_PROXY` | 按需 | 统一代理设置 |

示例：

```text
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=<生成的高强度随机字符串>
HTTPS_PROXY=http://proxy.example.com:7890
```

## 方式二：本地运行 Next.js

### 安装依赖

```bash
pnpm install --frozen-lockfile
```

### 开发模式

```bash
pnpm dev
```

默认访问：

```text
http://localhost:3000
```

### 使用代理运行

```bash
$env:HTTPS_PROXY = "http://127.0.0.1:10808"
pnpm dev
```

Linux/macOS：

```bash
HTTPS_PROXY=http://127.0.0.1:10808 pnpm dev
```

### 生产构建

```bash
pnpm lint
pnpm build
pnpm start
```

## 方式三：私有服务器运行 Next.js

适合需要固定域名、自管代理或放在内网的场景。

1. 安装 Node.js 22。
2. 启用 pnpm。

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

3. 拉取仓库并安装依赖。

```bash
git clone https://github.com/Matrtex/warpkey.git
cd warpkey
pnpm install --frozen-lockfile
```

4. 配置环境变量。

```bash
export NEXT_PUBLIC_APP_URL=https://warpkey.example.com
export CRON_SECRET=<生成的高强度随机字符串>
export HTTPS_PROXY=http://127.0.0.1:10808
```

5. 构建并启动。

```bash
pnpm build
pnpm start
```

## 方式四：旧版 Go 私有化部署

旧版 Go 实现在 `legacy_backup` 目录中，适合需要本地文件输出和脚本定时提交的使用方式。详细说明见 [旧版 Go 实现](Legacy-Go.md)。

## 验证部署

部署完成后检查以下接口：

```bash
curl -i https://your-app.vercel.app/api/full
curl -i https://your-app.vercel.app/api/lite
curl -i https://your-app.vercel.app/api/diff
curl -i -H "Authorization: Bearer <CRON_SECRET>" https://your-app.vercel.app/api/cron
```

预期结果：

- `/api/full` 返回多行 key。
- `/api/lite` 返回最多 15 行 key。
- `/api/diff` 返回 JSON。
- `/api/cron` 返回 `success: true`。

如果 `/api/full` 返回 `404 No keys found.`，优先检查服务器是否能访问 Telegram 公开页面，以及代理环境变量是否生效。
