# 宝塔面板9.2部署Chat API

### 关于宝塔

[宝塔面板](https://www.bt.cn/u/5OJvCS)（BT Panel）是一个简单易用的服务器管理面板，提供图形化界面来管理 Linux 和 Windows 服务器，支持网站、数据库、FTP、SSH 等多项功能的快速配置与管理。



### 部署Chat API

打开【Docker - 应用商店】，搜索关键词`Chat-API`，点击**安装**。

![baota](https://github.com/user-attachments/assets/5b392ef6-3d65-4909-8701-3a0272c454ed)

- 名称：保持默认，也可以自己修改
- 版本选择：`latest`
- 域名：填写你自己的域名
- 允许外部访问：填写域名后这个就不用勾选了
- 端口、CPU核心限制、内存限制：保持默认

将域名解析到你的服务器IP，然后访问域名。
   - 访问管理端：域名/admin 
   - 访问用户端：域名 

使用初始账号登录:

- 用户名: root
- 密码: 123456