# 澎湃记 - 自定义识别规则指南

## 简介

澎湃记使用 JSON 格式的规则配置文件来自动识别外卖取餐码、快递单号等信息。你可以通过修改规则文件来：

1. 添加新的品牌识别
2. 调整取码正则表达式
3. 自定义评分规则
4. 优化识别准确率

## 规则文件结构

### 基础信息部分

```json
{
  "schema_version": 1,
  "app_version": "26.4.17",
  "updated_at": "2026-04-23T00:00:00Z",
  "description": "自定义识别规则",
  
  // 其他配置...
}
```

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `schema_version` | 是 | 规则版本号，目前为 1 | `1` |
| `app_version` | 否 | 应用版本号，用于版本管理 | `"26.4.17"` |
| `updated_at` | 否 | 更新时间（ISO 8601 格式） | `"2026-04-23T00:00:00Z"` |
| `description` | 否 | 规则描述 | `"我的自定义规则"` |

---

## 品牌定义 (`brands`)

品牌分为三类：
- `drink`: 饮品品牌（奶茶、咖啡等）
- `food`: 餐食品牌（快餐、中餐等）
- `express`: 快递品牌

### 品牌对象字段

```json
{
  "name": "品牌名称",
  "aliases": ["别名1", "别名2"],
  "category": "餐食/饮品/快递",
  "package_name": "com.example.app",
  "keywords": ["关键词1", "关键词2"],
  "special_rules": {
    "require_qr_code": true
  },
  "scoring_overrides": {
    "exact_match_weight": 15
  }
}
```

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `name` | 是 | 品牌主名称 | `"喜茶"` |
| `aliases` | 否 | 别名列表，用于模糊匹配 | `["HEYTEA"]` |
| `category` | 是 | 归属类别 | `"饮品"` |
| `package_name` | 否 | Android 应用包名 | `"com.heyteago"` |
| `keywords` | 否 | 品牌相关关键词 | `["喜茶GO"]` |
| `special_rules` | 否 | 特殊规则配置 | `{"require_qr_code": true}` |
| `scoring_overrides` | 否 | 评分权重覆盖 | `{"exact_match_weight": 15}` |

### 示例：添加新品牌

```json
{
  "brands": {
    "drink": [
      // 添加新饮品品牌
      {
        "name": "茶百道",
        "category": "饮品",
        "keywords": ["茶百道"]
      },
      {
        "name": "瑞幸",
        "aliases": ["LUCKIN", "瑞幸咖啡"],
        "category": "饮品",
        "package_name": "com.lucky.luckyclient",
        "special_rules": {
          "require_qr_code": true
        }
      }
    ],
    "food": [
      // 添加新餐食品牌
      {
        "name": "塔斯汀",
        "category": "餐食",
        "keywords": ["中国汉堡"]
      }
    ],
    "express": [
      // 添加新快递品牌
      {
        "name": "极兔",
        "aliases": ["J&T"],
        "category": "快递"
      }
    ]
  }
}
```

---

## 取码提取规则 (`code_extraction`)

### 快递取码规则 (`express`)

```json
"express": {
  "trigger_keywords": ["取件码", "取性码", "请凭", "靖凭"],
  "patterns": [
    {
      "id": "express_3segment",
      "regex": "([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+)",
      "priority": 1,
      "description": "三段式连字符（A-2-7261）",
      "weight_multiplier": 20
    }
  ],
  "fallback_pattern": {
    "regex": "(?<![a-zA-Z0-9-])(你的正则表达式)(?![a-zA-Z0-9-])",
    "requires_trigger": true
  }
}
```

#### 模式对象字段

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `id` | 是 | 模式唯一标识 | `"express_3segment"` |
| `regex` | 是 | 正则表达式 | `"([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+)"` |
| `priority` | 是 | 优先级（越小越优先） | `1` |
| `description` | 否 | 模式描述 | `"三段式连字符"` |
| `weight_multiplier` | 否 | 评分权重倍数 | `20` |

### 餐食取码规则 (`food`)

```json
"food": {
  "trigger_keywords": ["取餐", "取茶", "验证码"],
  "hint_keywords": ["取单码", "取餐号", "取餐码"],
  "queue_keywords": ["叫号", "取号", "过号"],
  "queue_threshold": 2,
  "patterns": {
    "queue_patterns": [
      {
        "id": "queue_desk_code",
        "regex": "(小桌|中桌|大桌)\\s*([A-Z]{1,2}\\d{1,3}|\\d{1,3}[A-Z]{1,2})",
        "description": "桌型+码（小桌A3）",
        "code_length_min": 2,
        "code_length_max": 5,
        "require_mixed": true
      }
    ],
    "keyword_pattern": {
      "id": "keyword_code",
      "forward_regex": "取单码|取餐号[:：]?([A-Z0-9]{3,10})",
      "reverse_regex": "([A-Z0-9]{3,10})[:：]?(?:取单码|取餐号)"
    },
    "fallback_pattern": {
      "id": "food_fallback",
      "regex": "(?<![a-zA-Z0-9])([A-Z0-9]{3,10})(?![a-zA-Z0-9])",
      "priority": 5,
      "description": "全文兜底",
      "weight_multiplier": 1
    }
  }
}
```

---

## 类别检测 (`category_detection`)

```json
"category_detection": {
  "default_category": "餐食",
  "drink_triggers": {
    "brand_based": true,
    "text_keywords": ["奶茶", "咖啡"]
  },
  "express_triggers": {
    "text_keywords": ["取件", "快递", "包裹"],
    "brand_in_text": true
  }
}
```

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `default_category` | 是 | 默认类别 | `"餐食"` |
| `drink_triggers.brand_based` | 否 | 是否基于品牌判断 | `true` |
| `drink_triggers.text_keywords` | 否 | 饮品关键词列表 | `["奶茶", "咖啡"]` |
| `express_triggers.text_keywords` | 否 | 快递关键词列表 | `["取件", "快递"]` |
| `express_triggers.brand_in_text` | 否 | 是否检测品牌名 | `true` |

---

## 文本清理 (`text_cleaning`)

```json
"text_cleaning": {
  "datetime_pattern": "\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}",
  "corrections": [
    { "from": "取性码", "to": "取件码" },
    { "from": "取養号", "to": "取餐号" },
    { "from": "靖凭", "to": "请凭" }
  ],
  "char_removals": ["|"],
  "space_collapse": "(?<=[\\u4e00-\\u9fa5A-Z0-9-])\\s+(?=[\\u4e00-\\u9fa5])"
}
```

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `datetime_pattern` | 否 | 日期时间正则，用于过滤 | `"\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}"` |
| `corrections` | 否 | 文本修正规则列表 | `{"from": "取性码", "to": "取件码"}` |
| `char_removals` | 否 | 需要移除的字符列表 | `["|"]` |
| `space_collapse` | 否 | 空格压缩正则 | `"(?<=[\\u4e00-\\u9fa5])\\s+(?=[\\u4e00-\\u9fa5])"` |

---

## 验证规则 (`validation`)

### 快递取码验证

```json
"express_code": {
  "max_length": 12,
  "reject_all_letters": true,
  "reject_phone_pattern": "^1\\d{10}$",
  "reject_year_prefix": "202",
  "reject_year_length": 4,
  "reject_date_pattern": "^(0?[1-9]|1[0-2])-(0?[1-9]|[12]\\d|3[01])$",
  "phone_tail": {
    "length": 4,
    "digits_only": true,
    "mask_pattern": "\\*{2,}",
    "context_keywords": ["手机", "手机号", "电话", "尾号"]
  }
}
```

### 餐食取码验证

```json
"food_code": {
  "reject_year_prefix": "202",
  "reject_year_length": 4,
  "reject_time_contexts": [":", "/"],
  "reject_time_keywords": ["时间", "日期", "积分"],
  "distraction_words": ["ml", "g", "元", "¥", "券"],
  "distraction_range": 2
}
```

---

## 评分规则 (`scoring`)

```json
"scoring": {
  "brand_detection": {
    "keyword_match_weight": 4,
    "colon_match_weight": 1,
    "exact_match_weight": 15
  },
  "express_code": {
    "base_by_bbox_width": true,
    "dash_multiplier": 20,
    "letter_multiplier": 5
  },
  "food_code": {
    "base_by_bbox_width": true,
    "brand_overrides": {
      "肯德基": {
        "length_gte_4_letter_multiplier": 20,
        "length_5_digit_multiplier": 5
      },
      "麦当劳": {
        "length_gte_4_letter_multiplier": 20,
        "length_5_digit_multiplier": 5
      }
    }
  }
}
```

---

## 取件位置提取 (`pickup_location`)

```json
"pickup_location": {
  "start_keywords": ["已到", "已至", "到达", "到了"],
  "target_keywords": ["服务站", "驿站", "菜鸟驿", "自提点"],
  "stop_keywords": ["领取", "取件", "查看", "请凭"],
  "garbage_patterns": ["代收点(", "代收点（", "\\d{10,}"],
  "proximity_threshold": 400
}
```

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `start_keywords` | 是 | 开始关键词 | `["已到", "到达"]` |
| `target_keywords` | 是 | 目标地点关键词 | `["驿站", "自提点"]` |
| `stop_keywords` | 是 | 停止关键词 | `["领取", "取件"]` |
| `garbage_patterns` | 否 | 垃圾模式（需要过滤） | `["代收点("]` |
| `proximity_threshold` | 否 | 邻近阈值（像素） | `400` |

---

## 如何创建自定义规则

### 步骤 1: 复制默认规则

1. 复制 `app/src/main/assets/default_rules.json` 文件
2. 重命名为 `custom_rules.json`
3. 放在与默认规则相同的目录下

### 步骤 2: 修改规则文件

根据你的需求修改以下部分：

1. **添加新品牌**: 在 `brands` 部分添加新的品牌定义
2. **调整取码规则**: 修改 `code_extraction` 中的正则表达式
3. **优化验证**: 调整 `validation` 中的限制条件
4. **自定义评分**: 修改 `scoring` 中的权重配置

### 步骤 3: 测试规则

1. 打开APP（26.4.23.C01-Dev以上）- 设置 - 规则设置
2. 在识别规则内选择 `本地规则` / `在线规则` 进行添加
3. 触发识别功能进行识别
4. 根据识别结果调整规则

### 步骤 4: 分享规则

可以将你的自定义规则文件分享给其他用户：
- 通过Github Pages
- 直接分享 JSON 文件给好友
- 在社区论坛分享配置示例

---

## 正则表达式编写指南

### 常用正则模式

| 模式 | 说明 | 示例 |
|------|------|------|
| `[A-Z]` | 大写字母 | 匹配 A-Z |
| `[0-9]` | 数字 | 匹配 0-9 |
| `[A-Z0-9]` | 字母数字混合 | 匹配 A1, B2 等 |
| `{3,10}` | 长度限制 | 3到10个字符 |
| `+` | 一个或多个 | 至少1个 |
| `*` | 零个或多个 | 0个或多个 |
| `?` | 零个或一个 | 可选 |
| `\d` | 数字 | 等同于 `[0-9]` |
| `\w` | 单词字符 | `[A-Za-z0-9_]` |
| `-` | 连字符 | 匹配连字符 |
| `\.` | 点号 | 匹配 `.` |
| `( ... )` | 捕获组 | 提取匹配内容 |

### 示例正则表达式

1. **快递三段式**: `([A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+)`
2. **餐食取餐码**: `([A-Z0-9]{3,10})`
3. **星巴克口令**: `(\d{1,3}[.．][一-龥]{2,10})`
4. **排队号**: `(小桌|中桌|大桌)\s*([A-Z]{1,2}\d{1,3}|\d{1,3}[A-Z]{1,2})`

### 边界控制

| 模式 | 说明 | 示例 |
|------|------|------|
| `(?<!...)` | 负向后行断言 | 前面不是... |
| `(?<!pattern)` | 前面不是 pattern | `(?<![A-Z0-9])` |
| `(?!...)` | 负向前瞻断言 | 后面不是... |
| `(?!pattern)` | 后面不是 pattern | `(?![A-Z0-9])` |

示例：`(?<![A-Z0-9])([A-Z0-9]{3,10})(?![A-Z0-9])`

---

## 常见问题解答

### Q: 如何添加新的饮品品牌？
A: 在 `brands.drink` 数组中添加新的品牌对象，包含 `name`、`category`、`keywords` 等字段。

### Q: 为什么我的取餐码识别不准确？
A: 检查 `code_extraction.food` 中的正则表达式是否匹配你的取餐码格式，可能需要调整正则表达式或添加新的模式。

### Q: 如何提高特定品牌的识别率？
A: 在品牌定义中添加 `scoring_overrides` 字段，提高该品牌的评分权重。

### Q: 可以创建多个规则文件吗？
A: 目前应用仅能支持一个规则文件，但可以通过合并多个规则文件的内容来创建综合规则。

---

## 注意事项

1. **JSON 格式**: 确保规则文件是有效的 JSON 格式
2. **编码**: 文件必须使用 UTF-8 编码
3. **测试**: 每次修改后都要进行充分测试

---

*最后更新: 2026-04-24*