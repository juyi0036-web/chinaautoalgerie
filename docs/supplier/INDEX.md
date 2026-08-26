# 供应商档案索引 · Supplier Archive Index

> 用途：集中登记所有供应商来件（配置表 / FOB 报价单），方便后续调取与上新。
> 调取方式：按车型代号或文件名在 `docs/supplier/` 下查找；本索引提供关键信息速查。

---

## 1. SX11-A6-L 配置表（亚非拉版）

| 字段 | 内容 |
|---|---|
| 文件名 | `SX11-A6-L配置表_20260812.xlsx` |
| 来件日期 | 2026-08-12 |
| 车型平台 | 吉利 SX11（Binyue / Coolray 缤越平台） |
| 市场定位 | 亚洲-非洲-拉美（Asia-Africa-Latin America）出口版，5门5座 SUV |
| 配置等级 | **GS**（手动 MT） / **Gs+**（CVT + 电子驻车 EPB，主动安全全系标配） |
| 工作表 | 1 张：`左舵` — 配置特征清单（A1:E163，158 项配置明细） |
| ⚠️ 价格 | **本文件仅含配置，无 FOB 价格 / 成本拆分 / 供应商抬头 / 贸易术语** |

### 关键配置亮点（用于卖点提炼）
- **动力**：1.5L 自然吸气，90 kW / 152 N·m；GS=MT，Gs+=CVT；WLTC 6.46/6.89 L；排放 **欧六B (Euro VI-B)**
- **尺寸**：4330 × 1800 × 1609 mm，轴距 2600 mm
- **外观**：16" 铝合金轮毂 (215/65 R16)；仿碳纤维运动套件；尾翼；金属行李架；绿色夹层前挡 + 隐私后挡（O2 选配）
- **天窗**：选配 O3（原厂天窗）
- **车机语言**：非洲版 = 英语(初始) + 阿拉伯语 + 法语；亚太=英语；南美=西语+英语
- **影音**：8" 触控屏 + 无机芯主机；Apple CarPlay / Android Auto / Bluetooth / Mirror Link；4 扬声器；前后各 1×USB
- **安全/ADAS**：ABS+EBD、定速巡航、后雷达×4、倒车影像（两车均有）；ESC/TCS/HBA/HAC/HDC 在 GS 为选配 O1、Gs+ 标配；间接式 TPMS
- **质保**：表中未列（参考已上架 Coolray 668：原厂 4 年 / 10 万公里）

### 与已上架车型的关系
- 已上架 **Geely Coolray 668**（FOB 南沙 62,000 RMB）的卖点（天窗、原厂隐私玻璃、4年/10万公里质保、国际版车机 英/法/阿语）与 SX11-A6-L 的 **Gs+ 选满 O1/O2/O3** 高度吻合，疑似同一平台的出口配置变体。后续若需上新 SX11-A6-L，可复用 Coolray 668 的定价与卡片结构。

---

## 2. FOB 报价单汇总（法文 devis，PDF，2 页，版式对齐供应商 Livan 报价单；含 RMB + DZD 双列）

| 车型 | 文件名 | Incoterm | 裸车 RMB | 服务费 | FOB 总价 (RMB / DZD) | Réf. |
|---|---|---|---|---|---|---|
| Geely Coolray 668 | `Devis_FOB_Coolray.pdf` | FOB Nansha | 54,000 | 2,985 | 62,685 / 1,234,200 | CAA-FOB-COOLRAY668-2608-01 |
| Geely Livan X3 Pro 2026 | `Devis_FOB_Livan.pdf` | FOB Guangdong | 43,300 (Manuelle) | 3,000 | 55,100 / 1,084,900 | CAA-FOB-LIVANX3PRO-2608-01 |
| Volkswagen Lavida 2025 | `Devis_FOB_Lavida.pdf` | FOB Shanghai | 80,000 | 4,550 | 95,550 / 1,881,300 | CAA-FOB-LAVIDA2025-2608-01 |
| Volkswagen T-Cross 2023 (Occasion) | `Devis_FOB_Tcross.pdf` | FOB Shanghai | 8,900 | 900 | 21,200 / 417,200 | CAA-FOB-TCROSS2023-2608-01 |

> 说明：Livan 默认配置为 Manuelle（无天窗），另含 Manuelle+toit / Automatique+toit 两种变体；FOB 总价按默认配置计。
> DZD 按 1 RMB = 19.69 取整到百位（逐行取整后求和）。与网页计算器「先汇总 RMB 再取整」可能有约 1–2k DZD 的微小差异。
> 报价单由技能 `fob-devis-generator`（脚本 `gen_devis_fob.py`）统一生成，改价后重跑脚本即可。

### Coolray 668 明细备查
- 贸易术语：FOB Nansha（南沙）
- FOB 费用：5,700 RMB（代理1,500 + 报关600 + 港杂2,500 + 单证600 + 杂费500；内陆/商检/银行=0）
- 供应商：Shanghai Juyi Supply Chain Management Co., Ltd. (China Auto Algérie)
- 付款：50% 定金 + 50% 装船前，T/T；报价有效期 30 天；整柜发运（40HQ 约 4 台）

---

## 3. Volkswagen T-Cross 原始报价（留档参考）

| 字段 | 内容 |
|---|---|
| 原始位置 | `/Users/sheng.yu/Desktop/项目/syt/供应商/汽车/FOB_Export_Quotation_Volkswagen_T_Cross.docx` |
| 状态 | 已据此上架 T-Cross 2023（Occasion），数据已落入 `app/page.js` 的 `carModels.tcross`，并生成 `Devis_FOB_Tcross.pdf` |
| 说明 | 原始 docx 尚未复制到本档案目录；如需集中留存可后续补拷 |

---

## 调取提示
- 上架新车时：先查本索引确认代号与配置 → 按 `china-auto-algerie-vehicle-management` 技能在 `app/page.js` 的 `carModels` 添加条目 → 生成卡片 / 下拉 / 图片 → 构建推送。
- 生成 / 更新报价单时：用技能 `fob-devis-generator`（脚本 `gen_devis_fob.py`），改 `MODELS` 字典后运行即可批量产出，再拷入 `docs/supplier/`。
- 报价单缺失时：配置表不含价格（如 SX11-A6-L），需向供应商单独索取 FOB 报价单后再上新。
