# 个人读书笔记网站

一个基于 HTML + CSS + JavaScript 和 Supabase 的个人读书笔记管理网站，用于记录和管理个人阅读笔记。

## 功能特性

### 页面功能
- **首页 (index.html)** - 展示最近在读的书籍和推荐分类
- **书籍列表页 (books.html)** - 按分类查看所有书籍，支持分类筛选
- **笔记详情页 (notes.html)** - 查看特定书籍的所有笔记
- **添加笔记页 (add-note.html)** - 为书籍添加新的读书笔记

### 核心功能
- 📚 书籍管理（书名、作者、封面、阅读状态、分类）
- 📝 笔记管理（标题、内容、创建时间）
- 🏷️ 分类管理
- 🔍 分类筛选和搜索
- 📱 响应式设计（电脑端优化）

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Tailwind CSS (CDN引入)
- **后端**: Supabase (PostgreSQL + 实时API)
- **部署**: 支持 Netlify, Vercel 等静态托管平台

## 数据库结构

### Supabase 表结构

#### categories 表
- `id` (uuid, 主键)
- `name` (text, 分类名称)

#### books 表  
- `id` (uuid, 主键)
- `title` (text, 书名)
- `author` (text, 作者)
- `cover_url` (text, 封面图链接)
- `status` (text, 阅读状态: 'unread'/'reading'/'finished')
- `category_id` (uuid, 外键关联分类)
- `created_at` (timestamp, 创建时间)

#### notes 表
- `id` (uuid, 主键)  
- `book_id` (uuid, 外键关联书籍)
- `title` (text, 笔记标题)
- `content` (text, 笔记内容)
- `created_at` (timestamp, 创建时间)

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd booknote
```

### 2. 配置 Supabase
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中执行以下建表语句：

```sql
-- 创建分类表
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建书籍表
CREATE TABLE books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'reading', 'finished')),
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建笔记表
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全并设置策略（可选）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人读取分类" ON categories FOR SELECT USING (true);
CREATE POLICY "允许所有人读取书籍" ON books FOR SELECT USING (true);
CREATE POLICY "允许所有人读取笔记" ON notes FOR SELECT USING (true);
CREATE POLICY "允许所有人插入笔记" ON notes FOR INSERT WITH CHECK (true);
```

3. 插入示例数据：

```sql
-- 插入分类
INSERT INTO categories (name) VALUES 
('文学小说'),
('技术编程'),
('历史传记'),
('自我成长');

-- 插入示例书籍
INSERT INTO books (title, author, cover_url, status, category_id) VALUES
('三体', '刘慈欣', 'https://example.com/santi.jpg', 'finished', (SELECT id FROM categories WHERE name = '文学小说')),
('JavaScript高级程序设计', 'Nicholas C. Zakas', 'https://example.com/js.jpg', 'reading', (SELECT id FROM categories WHERE name = '技术编程')),
('人类简史', '尤瓦尔·赫拉利', 'https://example.com/history.jpg', 'unread', (SELECT id FROM categories WHERE name = '历史传记'));
```

### 3. 配置 Supabase 连接

在所有 HTML 文件的 Supabase 初始化部分替换为您的实际配置：

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
```

### 4. 本地运行

直接在浏览器中打开 `index.html` 文件，或使用本地服务器：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js http-server
npx http-server

# 使用 PHP
php -S localhost:8000
```

## 部署到 Netlify

1. 将代码推送到 GitHub 仓库
2. 登录 [Netlify](https://netlify.com)
3. 选择 "New site from Git"
4. 连接 GitHub 仓库
5. 构建设置：
   - Build command: (留空，因为是静态文件)
   - Publish directory: `/` (根目录)
6. 点击 "Deploy site"

## 项目结构

```
booknote/
├── index.html          # 首页
├── books.html          # 书籍列表页
├── notes.html          # 笔记详情页
├── add-note.html       # 添加笔记页
├── css/
│   └── style.css       # 自定义样式
├── js/
│   ├── index.js        # 首页逻辑
│   ├── books.js        # 书籍列表页逻辑
│   ├── notes.js        # 笔记详情页逻辑
│   └── add-note.js     # 添加笔记页逻辑
└── README.md           # 项目说明
```

## 功能说明

### 首页功能
- 展示最近在读的书籍（1-2本）
- 显示推荐分类（3-4个）
- 点击分类跳转到对应筛选的书籍列表

### 书籍列表页
- 左侧分类筛选栏
- 右侧书籍卡片展示
- 支持按分类筛选书籍
- 点击书籍卡片跳转到笔记详情页

### 笔记详情页
- 显示书籍完整信息
- 展示该书籍的所有笔记
- 按创建时间倒序排列
- 提供添加新笔记的快捷入口

### 添加笔记页
- 下拉选择书籍
- 输入笔记标题和内容
- 表单验证和错误提示
- 成功提交后跳转到笔记详情页

## 自定义和扩展

### 添加新功能
1. 在对应的 JavaScript 文件中添加新函数
2. 在 HTML 中添加相应的 UI 元素
3. 在 CSS 中添加样式规则

### 修改样式
- 主要样式使用 Tailwind CSS 类
- 自定义样式在 `css/style.css` 中
- 颜色主题可在 Tailwind 配置中修改

### 数据库扩展
如需添加新字段，请在 Supabase 中修改表结构，并更新对应的 JavaScript 代码。

## 注意事项

1. **Supabase 配置**: 确保使用正确的项目 URL 和 API Key
2. **CORS 设置**: Supabase 项目需要正确配置 CORS 设置
3. **数据安全**: 生产环境建议启用 Row Level Security (RLS)
4. **浏览器兼容**: 支持现代浏览器（Chrome, Firefox, Safari, Edge）

## 故障排除

### 常见问题
1. **数据加载失败**: 检查 Supabase 连接配置
2. **分类筛选不工作**: 确认分类名称匹配
3. **表单提交失败**: 查看浏览器控制台错误信息

### 调试技巧
- 打开浏览器开发者工具
- 查看 Network 标签页的网络请求
- 检查 Console 标签页的错误信息

## 许可证

MIT License

---

如有问题，请查看 [Supabase 文档](https://supabase.com/docs) 或创建 Issue。