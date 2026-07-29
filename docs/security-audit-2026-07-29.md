# China Auto Algérie 网站诊断报告

**域名**: chinaautoalgerie.com  
**检查时间**: 2026-07-29 10:10 GMT+8  
**检查人**: WorkBuddy

---

## 1. HTTPS 证书错误（用户截图问题）

**现象**: 浏览器访问 `https://chinaautoalgerie.com` 提示「你的连接不是专用连接」，错误码 `NET::ERR_CERT_COMMON_NAME_INVALID`，证书来自 `*.github.io`。

**根因**: 本地 DNS 解析到错误 IP，不是 GitHub 服务器。

| 检查项 | 结果 |
|--------|------|
| Namecheap 权威 DNS A 记录 | ✅ 正确：185.199.111.153 |
| Google DNS (8.8.8.8) | ✅ 正确：185.199.111.153 |
| Cloudflare DNS (1.1.1.1) | ✅ 正确：185.199.111.153 |
| 本地默认 DNS | ❌ 错误：198.18.2.180 |
| HTTP 访问 | ✅ 正常 200 |
| HTTPS 访问 | ❌ 证书验证失败 |

**结论**: 这不是网站代码漏洞，也不是 GitHub/Namecheap 配置错误。`198.18.2.180` 属于 RFC 2544 测试保留段，通常是中国网络环境下对 GitHub Pages 的 DNS 污染/劫持导致的。

**影响范围**: 仅影响中国境内部分网络访问。目标客户在阿尔及利亚使用当地网络访问，DNS 解析正常，HTTPS 理论上可正常加载（证书由 GitHub 自动签发后）。

**建议解决方案**（按优先级）:

1. **迁移 DNS 到 Cloudflare 并开启 Proxy（橙色云）** — 最稳，可绕过中国对 GitHub IPs 的直接污染
2. **测试时使用 8.8.8.8 / 1.1.1.1 DNS 或 VPN** — 临时方案
3. **在 GitHub Pages Settings → Pages 中勾选 "Enforce HTTPS"** — 确保证书签发后自动跳转

---

## 2. 代码安全扫描

| 检查项 | 结果 |
|--------|------|
| 硬编码密钥/Token/密码 | ✅ 未找到 |
| 混合内容（HTTP 资源） | ✅ 未找到 |
| 外部链接协议 | ✅ 全部使用 HTTPS |
| 私钥/RSA 文件 | ✅ 未找到 |
| WhatsApp 链接有效性 | ✅ `https://wa.me/85269724241` 302 正常 |
| 敏感信息泄露 | ✅ 未发现 |

**总体安全评级**: 低风险（静态展示站，无后端交互）。

---

## 3. 发现的功能缺陷（需修复）

### 联系表单未真正提交

**位置**: 页面底部 Formulaire de contact

**问题**: 表单提交后仅在前端显示 `✅ Demande envoyée !` 并重置字段，**并未将数据发送到任何服务器、邮箱或 WhatsApp**。

**影响**: 客户填写表单后会误以为已发送成功，但中国团队收不到任何信息，导致潜在客户流失。

**修复建议**（三选一）:

| 方案 | 实现难度 | 效果 |
|------|---------|------|
| A. 跳转 WhatsApp 预填消息 | 低 | 直接把客户带到 WhatsApp，自动带入姓名/车型/预算 |
| B. 使用 Formspree / Getform 等第三方表单服务 | 中 | 表单数据发到指定邮箱，无需自建后端 |
| C. 接入 Netlify Forms / Cloudflare Workers | 中 | 可自定义提交逻辑，适合后续扩展 |

**推荐**: 方案 A + 方案 B 组合 — 点击「Envoyer」后自动打开 WhatsApp 并预填咨询内容，同时静默提交一份备份到 Formspree 邮箱。

---

## 4. 其他建议

- 在 GitHub Pages Settings 中确认已启用 **Enforce HTTPS**
- 监控 `https://chinaautoalgerie.com` 在中国访问的稳定性，如长期不稳定可考虑 Cloudflare Pages + Cloudflare Proxy
- 后续替换 AI 生成的团队/车辆图片为真实照片，增强信任度
- 定期使用 [SSL Labs](https://www.ssllabs.com/ssltest/) 扫描证书配置

---

## 5. 修复清单

- [ ] GitHub Pages 启用 Enforce HTTPS
- [ ] 联系表单接入真实提交逻辑（WhatsApp + 表单服务）
- [ ] （可选）DNS 迁移到 Cloudflare 并开启 Proxy
- [ ] （可选）添加真实车辆/团队照片
