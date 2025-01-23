# Midjourney Proxy API文档

**简介**:Midjourney Proxy API文档

## 模型价格设置（在设置-运营设置-按次价格，启用按次）

### 模型列表

### midjourney-proxy支持

- mj_imagine (绘图)
- mj_variation (变换)
- mj_reroll (重绘)
- mj_blend (混合)
- mj_upscale (放大)
- mj_describe (图生文)

### midjourney-proxy-plus支持

- mj_shorten (提示词缩短)
- mj_inpaint (局部重绘)
- mj_customzoom  (自定义变焦)
- mj_action  (按钮变化)
- mj_swapface (换脸)
- mj_uploads (图像上传)

```json
{
  "mj_blend": 0.1,
  "mj_describe": 0.1,
  "mj_imagine": 0.1,
  "mj_reroll": 0.1,
  "mj_upscale": 0.1,
  "mj_variation": 0.1,
  "mj_action": 0.1,
  "mj_inpaint": 0.1,
  "mj_customzoom":0.1,
  "mj_swapface": 0.1,
  "mj_shorten": 0.1,
  "mj_uploads": 0.001,
  "mj_relax_imagine": 0.1,
  "mj_relax_variation": 0.1,
  "mj_relax_reroll": 0.1,
  "mj_relax_blend": 0.1,
  "mj_relax_describe": 0.1,
  "mj_relax_upscale": 0.05,
  "mj_relax_action": 0.1,
  "mj_relax_inpaint": 0.1,
  "mj_relax_customzoom":0.1,
  "mj_relax_swapface": 0.1,
  "mj_relax_shorten": 0.1,
  "mj_relax_uploads": 0.001
}
```

## 渠道设置

### 对接 Midjourney Proxy Admin（url/mj 正常请求fast模式）

1.

部署Midjourney Proxy Admin，并配置好midjourney账号等，[项目地址](https://github.com/trueai-org/midjourney-proxy)

2. 在渠道管理中添加渠道，渠道类型选择**Midjourney Proxy**，
   ，模型选择**midjourney**
3. 地址填写midjourney-proxy部署的地址，例如：http://localhost:8080
4. 密钥填写midjourney-proxy的密钥，如果没有设置密钥就为空

### 对接慢速（url/mj-relax/mj relax模式）

1. 在渠道管理中添加渠道，渠道类型选择**Midjourney Proxy**，模型自定义添加**midjourney-relax**，
2. 地址填写上游midjourney-proxyi的地址，例如：http://localhost:8081
3. 密钥填写midjourney-proxy的密钥，如果没有设置密钥就为空

