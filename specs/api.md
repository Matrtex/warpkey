# API 接口规格

## 基础约定

- 所有接口均使用 `GET`。
- 公开 key 接口返回 `text/plain`，每行一个 key。
- JSON 接口返回 `application/json`。
- 当前 API 结果来自实时抓取，不保证跨请求稳定。
- 调用方应自行做合理缓存，避免高频轮询。

## `GET /api/full`

返回当前实时抓取到的完整 key 列表，最多 100 个。

### 响应头

```http
Content-Type: text/plain
Cache-Control: s-maxage=10, stale-while-revalidate=30
```

### 成功响应

状态码：`200`

```text
xxxxxx-xxxxxx-xxxxxx
yyyyyy-yyyyyy-yyyyyy
```

### 错误响应

| 状态码 | 响应体 | 说明 |
| --- | --- | --- |
| `404` | `No keys found.` | 所有来源均未提取到 key。 |
| `500` | `Internal Server Error` | 服务端异常。 |

## `GET /api/lite`

返回从完整列表中随机抽取的精简列表，最多 15 个。

### 响应头

```http
Content-Type: text/plain
Cache-Control: s-maxage=10, stale-while-revalidate=30
```

### 成功响应

状态码：`200`

```text
aaaaaa-aaaaaa-aaaaaa
bbbbbb-bbbbbb-bbbbbb
```

### 重要行为

- 每次请求会重新执行抓取和随机抽样。
- 由于存在短缓存，边缘层可能在短时间内返回相同结果。
- 调用方不应依赖返回顺序。

### 错误响应

| 状态码 | 响应体 | 说明 |
| --- | --- | --- |
| `404` | `No keys found.` | 所有来源均未提取到 key。 |
| `500` | `Internal Server Error` | 服务端异常。 |

## `GET /api/diff`

返回兼容差异结构。当前 Web 主线不持久化历史，因此不计算真实新增和删除。

### 成功响应

状态码：`200`

```json
{
  "added": [],
  "removed": [],
  "kept": ["xxxxxx-xxxxxx-xxxxxx"],
  "lastUpdated": 1760000000000,
  "note": "Real-time mode: diff history disabled"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `added` | `string[]` | 当前固定为空数组。 |
| `removed` | `string[]` | 当前固定为空数组。 |
| `kept` | `string[]` | 当前请求生成的 full 列表。 |
| `lastUpdated` | `number` | Unix 毫秒时间戳。 |
| `note` | `string` | 说明实时模式下历史差异已禁用。 |

### 错误响应

状态码：`500`

```json
{
  "error": "Internal Server Error"
}
```

## `GET /api/cron`

受保护的健康检查接口。它会执行一次实时抓取，并返回完整结构，但不会写入数据库或文件。

### 鉴权

请求必须包含：

```http
Authorization: Bearer <CRON_SECRET>
```

服务端比较的是 `process.env.CRON_SECRET`。部署环境和 GitHub Actions secret 必须保持一致。

### 成功响应

状态码：`200`

```json
{
  "success": true,
  "full": ["xxxxxx-xxxxxx-xxxxxx"],
  "lite": ["xxxxxx-xxxxxx-xxxxxx"],
  "lastUpdated": 1760000000000
}
```

### 错误响应

| 状态码 | 响应体 | 说明 |
| --- | --- | --- |
| `401` | `Unauthorized` | Authorization 头缺失或 token 不匹配。 |
| `500` | `{"success":false,"error":"Internal Server Error"}` | 服务端异常。 |

## 调用示例

本地开发：

```bash
curl -sL http://localhost:3000/api/full
curl -sL http://localhost:3000/api/lite
curl -sL http://localhost:3000/api/diff
curl -sL -H "Authorization: Bearer ${CRON_SECRET}" http://localhost:3000/api/cron
```

生产环境：

```bash
curl -sL https://your-app.vercel.app/api/full > warp-full.txt
curl -sL https://your-app.vercel.app/api/lite > warp-lite.txt
```

## 兼容性要求

- 不要随意改变 `/api/full` 和 `/api/lite` 的纯文本返回格式。
- 不要在 key 行前后增加序号、JSON 包装或额外说明。
- 如果需要新增结构化接口，应新增 route，而不是改变现有文本接口。
- 如果未来实现真实 diff，应保持 `added`、`removed`、`kept`、`lastUpdated` 字段兼容。
