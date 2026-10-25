# AI 手记 · AI SEA

中文个人博客。文章以 Markdown 保存在 GitHub，通过 GitHub Actions 自动构建并发布到 https://ai-sea.github.io/ 。

## 编辑文章

1. 打开 content/posts，选择一篇 .md 文件，点击铅笔编辑。
2. 修改正文，保留文件顶部两行 --- 之间的 JSON 元数据。
3. 点击 Commit changes，提交到 main 分支。
4. 在 Actions 查看 Deploy blog to GitHub Pages，绿色成功后网站更新。

## 新增文章

在 content/posts 新建英文短横线文件名，例如 my-first-post.md：

```markdown
---
{
  "title": "我的第一篇文章",
  "category": "实践记录",
  "date": "2026-10-24",
  "description": "这篇文章的简短介绍。",
  "minutes": 3,
  "featured": false,
  "draft": false
}
---

## 从这里开始

这里写正文，支持 **粗体**、列表、链接与图片。
```

draft 为 true 时不会发布；提交到公开仓库的草稿源码仍然公开。featured 为 true 时设为首页精选，仅允许一篇。文件名决定文章网址，发布后尽量保持不变。分类支持实践记录、技术解析、思考随笔。删除文件并提交会从网站移除文章。

初始 7 篇文章为示例内容，可编辑或删除。图片可放在 public/images，正文使用 /images/文件名 引用。

## 本地开发与托管

Node.js 22 或更新版本：

```sh
npm ci
npm test
npm run build
npm run preview
```

打开 http://127.0.0.1:4173 。构建输出为 dist，亦可部署至 Cloudflare Pages（构建命令 npm run build，输出目录 dist）。GitHub Pages 的 Settings → Pages → Source 使用 GitHub Actions。无需数据库或额外密钥。

src/index.html 为首页模板，src/style.css 为阅读页样式。site.json 为站点元数据。每篇文章都有独立静态页面，支持直接访问、站点地图与 RSS（/feed.xml）。公开部署文件只包括构建后的网页，不包含开发工具配置。

## 文章系列

系列独立于分类。一篇文章仍选择原有分类，可额外添加可选的 series 元数据：

```json
"series": {
  "slug": "building-bots",
  "title": "从零构建 Bot",
  "order": 1
}
```

同一系列使用相同 slug 和 title，order 为唯一的正整数，决定阅读顺序，与发布日期无关。slug 使用英文小写和短横线，决定系列网址，发布后保持稳定。不属于系列的文章省略整个 series 字段。

网站自动生成 /series/ 总目录与 /series/building-bots/ 等系列目录页，文章内显示所属系列、展开目录和上一篇／下一篇。只有一篇时显示开篇与后续更新提示，不创建尚未发布的文章链接。草稿不进入目录或导航；序号允许有空缺。重复序号或同 slug 的标题不一致会让构建失败。系列目录会加入站点地图。

