# Chat API

> [!NOTE]
> 本项目是基于 [One API](https://github.com/songquanpeng/one-api) 和 [New API](https://github.com/Calcium-Ion/new-api) 进行二次开发的开源项目。感谢原作者的无私奉献。使用者必须在遵循 OpenAI 的[使用条款](https://openai.com/policies/terms-of-use)以及相关法律法规的情况下使用，不得用于非法用途。

> [!WARNING]
> 本项目仅供个人学习使用，不保证稳定性，且不提供任何技术支持。使用者必须遵守 OpenAI 的使用条款和相关法律法规，禁止用于非法用途。根据[《生成式人工智能服务管理暂行办法》](http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm)，请勿在中国地区向公众提供未经备案的生成式人工智能服务。



## 主要特性

### 用户体验
1. 全新 UI 界面（C 端和管理端 /admin）
2. 用户自选令牌计费方式（按倍率或按次）
3. 支持令牌分组和模型限制
4. 新用户默认分组设置及充值自动切换

### 通知与推送
1. 集成 WxPusher 消息推送
2. 在线充值通知
3. 用户低额度邮箱提醒

### 管理功能
1. 详细日志查看（管理员专用）
2. 自定义网站描述（用于 TG 预览）
3. 新用户注册时间显示
4. 渠道自启时间设置
5. 渠道 RPM 限制配置
6. 渠道复制和批量编辑
7. 单渠道代理设置
8. 渠道自定义请求头
9. 支持渠道标签化管理
10. 日志显示错误返回信息
11. 支持验证渠道返回信息
12. 支持 Claude thinking


### 计费与优惠
1. 按过期时间设置充值倍率
2. 邀请用户充值返利系统
3. 自定义充值折扣方案

### 技术特性
1. 支持 GPT-4V 通用格式
2. 支持 Claude 原始请求方式
3. 支持 GCP-Claude（RT 和密钥两种方式）
4. 上游空返回重试机制
5. 令牌自定义后缀功能
6. 支持Claude Cache-Control 缓存控制



## 部署指南

### 1. 宝塔一键部署

- 适用于宝塔 9.2 及以上版本
- 未安装宝塔面板可前往[宝塔官网](https://www.bt.cn/u/5OJvCS)安装
- 详细步骤请参考[宝塔一键部署指南](./BT.md)

### 2. Docker 部署

```shell
# SQLite 方式
docker run --name chat-api -d \
  --restart always \
  -p 3000:3000 \
  -e TZ=Asia/Shanghai \
  ai365/chat-api:latest

# MySQL 方式 
docker run --name chat-api -d \
  --restart always \
  -p 3000:3000 \
  -e SQL_DSN="root:123456@tcp(localhost:3306)/oneapi" \
  -e TZ=Asia/Shanghai \
  ai365/chat-api:latest
```

### 3. Docker Compose 部署

```shell
# 启动服务
docker-compose up -d

# 查看运行状态
docker-compose ps
```

### 4. 手动部署

1. 下载或编译可执行文件
2. 运行程序
3. 
   - 访问管理端：http://localhost:3000/admin 
   - 访问用户端：http://localhost:3000/ 
4. 使用初始账号登录:
   - 用户名: root
   - 密码: 123456


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

## 界面预览


#### C端

![用户界面](https://github.com/user-attachments/assets/e9c459b5-7e8d-47f9-884b-485bf89c34b9)



![令牌界面](https://github.com/user-attachments/assets/aed8848b-05ff-4adc-a141-a7fe81506f68)



![日志界面](https://github.com/user-attachments/assets/f4ce6400-200a-47d5-97d6-4811700625d9)

![模型计费](https://github.com/user-attachments/assets/0389a065-00f3-41ac-9fb1-0c7eccd41d49)


![渠道管理](https://github.com/user-attachments/assets/69a8511c-e976-45a1-b3ab-a33fbbdadbee)



#### 管理端

![管理界面](https://github.com/user-attachments/assets/84534621-47cf-4a76-8c99-69a35fd6f871)



![渠道管理](https://github.com/user-attachments/assets/c83b08ff-d731-4a0e-a4ca-dfeea97947e2)


![管理日志](https://github.com/user-attachments/assets/a8cb630c-6b65-4147-856e-d9b5887b5233)


![运营设置](https://github.com/user-attachments/assets/c0ea81c2-33fd-404b-87b5-3673a4309d3a)



![支付设置](https://github.com/user-attachments/assets/20fe1fa6-c220-4867-b819-ec6721105c30)






## 赞助支持

如果觉得这个软件对你有所帮助，欢迎请作者喝可乐、喝咖啡～

<img src="https://github.com/ai365vip/chat-api/assets/154959065/31289586-f7a6-4640-bf8c-e6d6c97db581" width="250"  style="margin-right: 100px;">                                                    <img 
src="https://github.com/ai365vip/chat-api/assets/154959065/bf2d09f4-4569-481c-9328-754a4bc9f67c" width="250">