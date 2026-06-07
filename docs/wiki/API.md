# API 文档

所有公开 key 接口都使用 `GET` 方法。`/api/full` 和 `/api/lite` 返回 `text/plain`，每行一个 key。

## 基础地址

生产环境请使用你的部署域名：

```text
https://your-app.vercel.app
```

本地开发环境：

```text
http://localhost:3000
```

## GET /api/full

返回当前实时抓取到的完整 key 列表，最多 100 个。

### 请求

```bash
curl -sL https://your-app.vercel.app/api/full
```

### 响应

```text
xxxxxx-xxxxxx-xxxxxx
yyyyyy-yyyyyy-yyyyyy
zzzzzz-zzzzzz-zzzzzz
```

### 状态码

| 状态码 | 含义 |
| --- | --- |
| `200` | 成功返回 key 列表 |
| `404` | 当前没有抓取到 key |
| `500` | 服务端抓取或处理异常 |

## GET /api/lite

返回从完整列表中随机抽取的精简列表，最多 15 个。

### 请求

```bash
curl -sL https://your-app.vercel.app/api/lite
```

### 响应

```text
aaaaaa-aaaaaa-aaaaaa
bbbbbb-bbbbbb-bbbbbb
```

## GET /api/diff

返回当前列表和兼容字段。主线 Web 版本不持久化历史，因此不计算真实新增和移除。

### 请求

```bash
curl -sL https://your-app.vercel.app/api/diff
```

### 响应

```json
{
  "added": [],
  "removed": [],
  "kept": ["xxxxxx-xxxxxx-xxxxxx"],
  "lastUpdated": 1760000000000,
  "note": "Real-time mode: diff history disabled"
}
```

## GET /api/cron

受保护的健康检查接口。它会执行一次实时抓取，并返回 full/lite 结果。该接口不写入数据库，也不提交文件。

### 请求头

```http
Authorization: Bearer <CRON_SECRET>
```

### 请求

```bash
curl -sL \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-app.vercel.app/api/cron
```

### 成功响应

```json
{
  "success": true,
  "full": ["xxxxxx-xxxxxx-xxxxxx"],
  "lite": ["xxxxxx-xxxxxx-xxxxxx"],
  "lastUpdated": 1760000000000
}
```

### 状态码

| 状态码 | 含义 |
| --- | --- |
| `200` | 鉴权成功并完成抓取 |
| `401` | `Authorization` 头缺失或 `CRON_SECRET` 不匹配 |
| `500` | 服务端抓取或处理异常 |

## 集成示例

保存完整列表：

```bash
curl -sL https://your-app.vercel.app/api/full > warp-full.txt
```

保存精简列表：

```bash
curl -sL https://your-app.vercel.app/api/lite > warp-lite.txt
```

定时检查 cron：

```bash
curl --fail --show-error --silent \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-app.vercel.app/api/cron
```

## 使用建议

- 不要高频轮询公开 API，建议客户端至少间隔 30 到 60 秒。
- 如果调用方需要稳定结果，优先使用 `/api/full` 并自行缓存。
- 如果只需要少量 key，使用 `/api/lite` 可以降低客户端处理成本。
- `/api/diff` 当前是兼容接口，不适合做历史变更统计。
