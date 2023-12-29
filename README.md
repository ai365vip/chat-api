# Chat API

> [!NOTE]
> 本项目为开源项目，在[New API](https://github.com/Calcium-Ion/new-api)与[MartialBE](https://github.com/MartialBE/one-api)的基础上进行二次开发，感谢原作者的无私奉献。
> 使用者必须在遵循 OpenAI 的[使用条款](https://openai.com/policies/terms-of-use)以及**法律法规**的情况下使用，不得用于非法用途。

> [!WARNING]
> 本项目为个人学习使用，不保证稳定性，且不提供任何技术支持，使用者必须在遵循 OpenAI 的使用条款以及法律法规的情况下使用，不得用于非法用途。
> 根据[《生成式人工智能服务管理暂行办法》](http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm)的要求，请勿对中国地区公众提供一切未经备案的生成式人工智能服务。

> [!NOTE]
> 最新版Docker镜像 ai365/chat-api:latest
> 更新指令 docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -cR

## 此分叉版本的主要变更

1. 全新的UI界面，C端与管理端 (/admin)
2. 添加[Midjourney-Proxy](https://github.com/novicezk/midjourney-proxy)接口的支持：
   + [X]  /mj/submit/imagine
   + [X]  /mj/submit/change
   + [X]  /mj/submit/blend
   + [X]  /mj/submit/describe
   + [X]  /mj/image/{id} （通过此接口获取图片，**请必须在系统设置中填写服务器地址！！**）
   + [X]  /mj/task/{id}/fetch （此接口返回的图片地址为经过One API转发的地址）
3. 支持在线充值功能，可在系统设置中设置，当前支持的支付接口：
   + [X]  易支付
4. 支持用key查询使用额度:
   + 配合项目[neko-api-key-tool](https://github.com/Calcium-Ion/neko-api-key-tool)可实现用key查询使用情况，方便二次分销
5. 渠道显示已使用额度，支持指定组织访问
6. 分页支持选择每页显示数量
7. 支持 gpt-4-1106-vision-preview，dall-e-3，tts-1
8. 支持第三方模型 **gps** （gpt-4-gizmo-*），在渠道中添加自定义模型gpt-4-gizmo-*即可
9. 兼容原版One API的数据库，可直接使用原版数据库（one-api.db）
10. 支持模型按次数收费，可在 系统设置-运营设置 中设置
11. 支持普通用户自行选择令牌按倍率、按次收费
12. 支持gemini-pro模型
13. 支持令牌分组
14. 支持批量创建令牌
15. 支持WxPusher消息推送，在线充值通知
16. 支持渠道自启时间设置

## 部署

### 基于 Docker 进行部署

```shell
# 使用 SQLite 的部署命令：
docker run --name chat-api -d --restart always -p 3000:3000 -e TZ=Asia/Shanghai -v /home/ubuntu/data/chat-api:/data ai365/chat-api:latest
# 使用 MySQL 的部署命令，在上面的基础上添加 `-e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi"`，请自行修改数据库连接参数。
# 例如：
docker run --name chat-api -d --restart always -p 3000:3000 -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" -e TZ=Asia/Shanghai -v /home/ubuntu/data/chat-api:/data ai365/chat-api:latest
```

### 手动部署

1. 从 [GitHub Releases](https://github.com/songquanpeng/one-api/releases/latest) 下载可执行文件或者从源码编译：

   ```shell
   git clone https://github.com/ai365vip/chat-api.git

   # 构建前端
   cd chat-api/web-admin
   npm install
   npm run build

   cd ..
   cd chat-api/web-user
   npm install
   npm run build

   # 构建后端
   cd ..
   go mod download
   go build -ldflags "-s -w" -o chat-api
   ```
2. 运行：

   ```shell
   chmod u+x chat-api
   .env //设置环境变量 放在同一目录下
   ./chat-api --port 3000 --log-dir ./logs
   ```
3. 访问 [http://localhost:3000/](http://localhost:3000/) 并登录。初始账号用户名为 `root`，密码为 `123456`。
4. 管理端访问 [http://localhost:3000/](http://localhost:3000/admin) 并登录。初始账号用户名为 `root`，密码为 `123456`。

### 环境变量

1. `REDIS_CONN_STRING`：设置之后将使用 Redis 作为缓存使用。
   - 例子：`REDIS_CONN_STRING=redis://default:redispw@localhost:49153`
   - 如果数据库访问延迟很低，没有必要启用 Redis，启用后反而会出现数据滞后的问题。
2. `SESSION_SECRET`：设置之后将使用固定的会话密钥，这样系统重新启动后已登录用户的 cookie 将依旧有效。
   - 例子：`SESSION_SECRET=random_string`
3. `SQL_DSN`：设置之后将使用指定数据库而非 SQLite，请使用 MySQL 或 PostgreSQL。
   - 例子：
     - MySQL：`SQL_DSN=root:123456@tcp(localhost:3306)/oneapi`
     - PostgreSQL：`SQL_DSN=postgres://postgres:123456@localhost:5432/oneapi`（适配中，欢迎反馈）
   - 注意需要提前建立数据库 `oneapi`，无需手动建表，程序将自动建表。
   - 如果使用本地数据库：部署命令可添加 `--network="host"` 以使得容器内的程序可以访问到宿主机上的 MySQL。
   - 如果使用云数据库：如果云服务器需要验证身份，需要在连接参数中添加 `?tls=skip-verify`。
   - 请根据你的数据库配置修改下列参数（或者保持默认值）：
     - `SQL_MAX_IDLE_CONNS`：最大空闲连接数，默认为 `100`。
     - `SQL_MAX_OPEN_CONNS`：最大打开连接数，默认为 `1000`。
       - 如果报错 `Error 1040: Too many connections`，请适当减小该值。
     - `SQL_CONN_MAX_LIFETIME`：连接的最大生命周期，默认为 `60`，单位分钟。
4. `FRONTEND_BASE_URL`：设置之后将重定向页面请求到指定的地址，仅限从服务器设置。
   - 例子：`FRONTEND_BASE_URL=https://openai.justsong.cn`
5. `MEMORY_CACHE_ENABLED`：启用内存缓存，会导致用户额度的更新存在一定的延迟，可选值为 `true` 和 `false`，未设置则默认为 `false`。
   - 例子：`MEMORY_CACHE_ENABLED=true`
6. `SYNC_FREQUENCY`：在启用缓存的情况下与数据库同步配置的频率，单位为秒，默认为 `600` 秒。
   - 例子：`SYNC_FREQUENCY=60`
7. `NODE_TYPE`：设置之后将指定节点类型，可选值为 `master` 和 `slave`，未设置则默认为 `master`。
   - 例子：`NODE_TYPE=slave`
8. `CHANNEL_UPDATE_FREQUENCY`：设置之后将定期更新渠道余额，单位为分钟，未设置则不进行更新。
   - 例子：`CHANNEL_UPDATE_FREQUENCY=1440`
9. `CHANNEL_TEST_FREQUENCY`：设置之后将定期检查渠道，单位为分钟，未设置则不进行检查。
   - 例子：`CHANNEL_TEST_FREQUENCY=1440`
10. `POLLING_INTERVAL`：批量更新渠道余额以及测试可用性时的请求间隔，单位为秒，默认无间隔。
    - 例子：`POLLING_INTERVAL=5`
11. `BATCH_UPDATE_ENABLED`：启用数据库批量更新聚合，会导致用户额度的更新存在一定的延迟可选值为 `true` 和 `false`，未设置则默认为 `false`。
    - 例子：`BATCH_UPDATE_ENABLED=true`
    - 如果你遇到了数据库连接数过多的问题，可以尝试启用该选项。
12. `BATCH_UPDATE_INTERVAL=5`：批量更新聚合的时间间隔，单位为秒，默认为 `5`。
    - 例子：`BATCH_UPDATE_INTERVAL=5`
13. 请求频率限制：
    - `GLOBAL_API_RATE_LIMIT`：全局 API 速率限制（除中继请求外），单 ip 三分钟内的最大请求数，默认为 `180`。
    - `GLOBAL_WEB_RATE_LIMIT`：全局 Web 速率限制，单 ip 三分钟内的最大请求数，默认为 `60`。
14. 编码器缓存设置：
    - `TIKTOKEN_CACHE_DIR`：默认程序启动时会联网下载一些通用的词元的编码，如：`gpt-3.5-turbo`，在一些网络环境不稳定，或者离线情况，可能会导致启动有问题，可以配置此目录缓存数据，可迁移到离线环境。
    - `DATA_GYM_CACHE_DIR`：目前该配置作用与 `TIKTOKEN_CACHE_DIR` 一致，但是优先级没有它高。
15. `RELAY_TIMEOUT`：中继超时设置，单位为秒，默认不设置超时时间。
16. `SQLITE_BUSY_TIMEOUT`：SQLite 锁等待超时设置，单位为毫秒，默认 `3000`。

## 界面截图

![image](https://github.com/ai365vip/chat-api/assets/154959065/13fde0aa-aa19-4c2f-9ace-611fb9cd60b8)

![image](https://github.com/ai365vip/chat-api/assets/154959065/327c6919-5fe6-4219-855d-1c09498ee567)

![image](https://github.com/ai365vip/chat-api/assets/154959065/0017e8cb-645b-4c05-aefa-6cd538989278)

![image](https://github.com/ai365vip/chat-api/assets/154959065/8c4ea0cd-c4fb-4074-8080-4998b0fcda20)
![image](https://github.com/ai365vip/chat-api/assets/154959065/b16aa85f-48ff-4843-af11-d88a6e596679)

## 赞助

如果觉得这个软件对你有所帮助，欢迎请作者喝可乐、喝咖啡～

<img src="https://github.com/ai365vip/chat-api/assets/154959065/31289586-f7a6-4640-bf8c-e6d6c97db581" width="250"  style="margin-right: 100px;">                                                    <img 
src="https://github.com/ai365vip/chat-api/assets/154959065/bf2d09f4-4569-481c-9328-754a4bc9f67c" width="250">
