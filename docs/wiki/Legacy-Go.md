# 旧版 Go 实现

旧版 Go 实现保留在 `legacy_backup` 目录中。它适合需要在本地服务器上定时抓取、落盘保存、再由脚本提交到 Git 仓库的场景。

## 目录

```text
legacy_backup/
  main.go       旧版采集程序
  build.sh      构建脚本
  update.sh     定时更新脚本
  data/full     历史完整列表
  data/lite     历史精简列表
  README.md     英文说明
  README_CN.md  中文说明
```

## 构建

```bash
cd legacy_backup
chmod a+x build.sh
./build.sh
```

构建产物会输出到脚本定义的位置，具体以 `build.sh` 为准。

## 运行

```bash
./build/warpkey
```

使用代理：

```bash
./build/warpkey --proxy http://127.0.0.1:10808
```

## 自动更新

旧版脚本可通过 `crontab` 定时运行：

```cron
0 * * * * cd /path/to/warpkey/legacy_backup && ./update.sh
```

如果脚本中包含 Git 提交和推送，建议确认：

- Git remote 指向正确仓库。
- 服务器上已配置 SSH key 或 HTTPS token。
- 需要代理时，Git 推送也配置代理。
- 不要把 token、代理密码或私密 key 写入仓库。

## 与主线 Next.js 版本的区别

| 项目 | Next.js 主线版本 | Go 旧版 |
| --- | --- | --- |
| 数据模式 | 请求时实时抓取 | 抓取后写入本地文件 |
| 部署方式 | Vercel 或 Node.js 服务 | Linux 服务器或本地二进制 |
| 历史记录 | 默认不保存 | 可通过文件和 Git 历史保存 |
| API | Next.js route | 静态文件或自定义服务 |
| 代理 | 环境变量 | 命令行参数 |

## 迁移建议

- 只需要 Web UI 和 API：使用 Next.js 主线版本。
- 需要保存历史 key 文件：继续使用 Go 旧版，或为 Next.js 版本新增数据库/对象存储。
- 需要同时保留两种方式：用 Next.js 对外服务，用 Go 旧版在内部生成备份文件。
