# 收藏夹功能产品需求文档 (PRD)

## Figma链接
- My List 主页面：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3194-7722&m=dev
  - create list 弹窗： https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3252-6958&m=dev
    - List privacy： https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3252-5162&m=dev
  - Edit list 弹窗：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3251-4852&m=dev
  - Delete list 弹窗：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3252-5317&m=dev
- 具体某个List detail页面：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3195-8107&m=dev
  - List detail management: https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3251-4639&m=dev
  - List share 弹窗：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3279-972&m=dev
- 用户查看别人分享的 list 链接：https://www.figma.com/design/rZfpo9vqZzjxENYkf4B4aQ/ECF-MVP-2025?node-id=3281-3259&m=dev

## 1. 项目概述

### 1.1 功能简介
实现用户的项目收藏夹功能，允许用户创建、管理和分享自定义的项目列表。用户可以创建多个收藏夹，对项目进行分类管理，并可以关注其他用户公开的收藏夹。

### 1.2 目标用户
- 平台注册用户：创建和管理自己的收藏夹
- 访客用户：浏览公开的收藏夹内容
- 社区用户：关注和分享收藏夹

## 2. 功能需求

### 2.1 Profile 页面重构

#### 2.1.1 导航栏调整
- **现状**：Profile 页面顶部有 Tab 导航
- **目标**：将 Tab 导航从顶部移动到左侧垂直布局
- **Tab 列表**：
  - Profile Settings
  - My Contributions  
  - My Upvotes
  - **My Lists** (新增)

#### 2.1.2 左侧导航样式
- 采用垂直菜单布局
- 选中状态高亮显示
- 支持图标 + 文字的形式
- My Lists 使用书签图标

### 2.2 My Lists 主页面

#### 2.2.1 页面结构
```
My Lists (主标题)
├── My Lists (我的收藏夹)
│   ├── 收藏夹列表
│   └── Create New List 按钮
└── Following Lists (关注的收藏夹)
    └── 关注的收藏夹列表
```

#### 2.2.2 My Lists 区域
- **默认收藏夹**：
  - 系统自动创建 "Bookmarked Projects (Default)"
  - 显示为私有状态 (Private 图标)
  - 包含可选的描述文字
  
- **用户创建的收藏夹**：
  - 显示收藏夹名称
  - 显示隐私状态 (Public/Private)
  - 可选的描述文字
  - 操作菜单 (三点按钮)

- **操作菜单选项**：
  - Edit List (编辑图标)
  - Share List (分享图标) 
  - Delete (删除，红色文字)

- **Create New List 按钮**：
  - 位于 My Lists 区域底部
  - 点击展开创建弹窗

#### 2.2.3 Following Lists 区域
- 显示关注的公开收藏夹
- 每个收藏夹显示：
  - 收藏夹名称和描述
  - 创建者头像和用户名 ("by: username")
  - Leave List 按钮 (取消关注)
  - 操作菜单 (三点按钮)

#### 2.2.4 分页功能
- My Lists 和 Following Lists 均需要支持分页
- 使用无限滚动或分页组件
- 每页默认显示 20 条记录

### 2.3 创建收藏夹弹窗

#### 2.3.1 弹窗字段
- **List Name** (必填)
  - 文本输入框
  - 占位符：type a name for this list
  - 字符限制：0/150

- **List Description** (可选)
  - 多行文本框  
  - 占位符：type a description
  - 字符限制：0/5000

- **List Privacy** (必填)
  - 下拉选择框
  - 选项：Private (默认) / Public

#### 2.3.2 隐私选项详细说明
- **Public**: Anyone can view (任何人可查看，地球图标)
- **Private**: Only you can view (仅自己可查看，锁定图标)  
- **Share-only**: Anyone with link can view (仅链接分享，链接图标，**灰色状态，暂未实现**)

#### 2.3.3 操作按钮
- Cancel：取消创建
- Create：确认创建

### 2.4 编辑收藏夹弹窗

#### 2.4.1 功能同创建弹窗
- 预填充现有数据
- 支持修改名称、描述、隐私设置
- 操作按钮：Cancel / Save

### 2.5 删除收藏夹确认弹窗

#### 2.5.1 弹窗内容
- **标题**：Delete List?
- **确认文本**：Deleting this list cannot be undone
- **操作按钮**：
  - 关闭按钮 (X 图标)
  - Yes, Delete (红色背景，带垃圾桶图标)

#### 2.5.2 交互行为
- 点击删除操作后显示确认弹窗
- 用户必须明确确认才能执行删除
- 删除操作不可撤销

### 2.6 收藏夹详情页面

#### 2.6.1 页面头部
- **面包屑导航**：支持多级返回导航
- **收藏夹标题**：显示收藏夹名称，右侧有编辑图标
- **描述信息**：显示收藏夹描述文字
- **隐私状态图标**：Private 显示锁定图标
- **分享操作**：提供便捷分享入口

#### 2.6.2 项目列表区域
- **Organize List 按钮**：右上角设置图标，点击进入管理模式
- 使用现有的 ProjectCard 组件展示项目
- 每个项目卡片显示：
  - 项目缩略图/占位图 (100x100px)
  - 项目名称
  - 项目描述
  - 标签 (Protocol, DAO 等)
  - 评分/投票数 (绿色箭头 + 6.9k)

#### 2.6.3 管理模式详细交互
- **进入管理模式**：点击 "Organize List" 按钮
- **管理模式界面变化**：
  - 顶部显示：**"Discard Changes"** 和 **"Save Changes"** 按钮
  - 每个项目卡片右侧显示：
    - **删除图标 (×)**：点击可移除项目
    - **六点拖拽手柄**：支持拖拽重新排序
  - 项目卡片背景有视觉反馈显示可编辑状态

#### 2.6.4 拖拽排序功能
- **拖拽行为**：
  - 鼠标悬停在拖拽手柄上显示拖拽光标
  - 拖拽过程中项目卡片有视觉反馈
  - 支持上下拖拽调整项目顺序
- **保存机制**：
  - 拖拽操作后需要点击 "Save Changes" 才能保存
  - 点击 "Discard Changes" 可恢复原始顺序

### 2.7 分享收藏夹功能

#### 2.7.1 分享弹窗
- **弹窗标题**：Share List
- **分享提示**：You are sharing: [收藏夹名称]
- **分享链接**：
  - 格式：https://pensive.ecf.network/u/[userId]/list/[listId]
  - **注意**：实际实现中使用数字ID，而非用户地址和slug
  - 复制按钮 (复制图标) 位于输入框右侧

#### 2.7.2 隐私访问控制
- **公开收藏夹**：任何人通过链接可直接访问
- **私有收藏夹**：访问时显示全局弹窗提示无权限

### 2.8 他人查看分享收藏夹

#### 2.8.1 公开收藏夹页面
- **页面头部显示**：
  - 收藏夹名称和描述
  - 创建者信息 ("by: username" + 头像)
  - 关注者数量 ("Followers: 58")
  - **关注按钮区域**：两个状态切换按钮

#### 2.8.2 关注/取消关注功能
- **Follow This List 按钮**：
  - 浅灰色背景，加号图标
  - 点击后添加到个人的 Following Lists
- **Unfollow 按钮**：
  - 红色文字，退出图标
  - 点击后从 Following Lists 中移除
- **交互行为**：
  - 两个按钮互斥显示（根据当前关注状态）
  - 实时更新关注者数量

#### 2.8.3 私有收藏夹访问限制
- 访问私有收藏夹时显示全局弹窗
- 提示信息：无权限访问该私有收藏夹
- 提供返回或关闭选项

## 3. 技术实现要求

### 3.1 后端接口 (已实现)

基于 `lib/trpc/routers/list.ts` 的现有接口：

#### 3.1.1 已有接口
- `getUserLists`: 获取用户的收藏夹列表
- `getListBySlug`: 通过 slug 获取收藏夹详情
- `getListProjects`: 获取收藏夹内的项目 (支持分页)
- `getUserFollowedLists`: 获取用户关注的收藏夹
- `createList`: 创建收藏夹
- `updateList`: 更新收藏夹信息
- `deleteList`: 删除收藏夹
- `addProjectToList`: 向收藏夹添加项目
- `removeProjectFromList`: 从收藏夹移除项目
- `followList`: 关注收藏夹
- `unfollowList`: 取消关注收藏夹

#### 3.1.2 需要补充的接口
- 项目排序功能：`updateProjectOrder` 
- 批量项目操作：`batchRemoveProjects`
- **分享链接格式确认**：确认使用数字ID还是slug格式

### 3.2 前端技术栈
- **UI 框架**：Hero UI + Tailwind CSS
- **状态管理**：TanStack Query (React Query)
- **拖拽功能**：React DnD 或 @dnd-kit
- **路由**：Next.js App Router
- **组件复用**：使用现有的 ProjectCard 组件，其他组件也尽量复用已有的，基础组件优先从components/base取
- **icon**: 尽量复用已有的icon, 可以参考components/icons，如果没有，从 Figma读取到 SVG 内容后，新建 icon 文件到components/icons目录下

### 3.3 页面路由设计
```
/profile/[address]
├── /profile/[address]?tab=lists (My Lists 主页)
├── /profile/[address]/list/[slug] (收藏夹详情页)
└── /u/[userId]/list/[listId] (公开分享链接，使用数字ID)
```

**注意**：根据 Figma 设计稿，分享链接使用数字ID格式，需要与后端确认具体实现。

## 4. 用户体验设计

### 4.1 交互流程

#### 4.1.1 创建收藏夹流程
1. 用户进入 Profile → My Lists
2. 点击 "Create New List" 按钮
3. 填写收藏夹信息 (名称、描述、隐私设置)
4. 点击 Create 按钮创建
5. 页面刷新显示新创建的收藏夹

#### 4.1.2 管理收藏夹流程
1. 用户点击收藏夹卡片进入详情页
2. 点击 "Organize List" 进入管理模式
3. 执行拖拽排序或移除项目操作
4. 点击 "Save Changes" 保存修改
5. 退出管理模式显示最新状态

#### 4.1.3 分享收藏夹流程
1. 在收藏夹详情页点击 "Share List"
2. 弹窗显示分享链接
3. 用户复制链接进行分享
4. 其他用户通过链接访问收藏夹
5. 支持关注/取消关注操作

### 4.2 响应式设计
- **移动端 (1-809px)**：
  - 左侧导航可收缩为抽屉式
  - 收藏夹卡片单列显示
  - 简化操作菜单
- **平板端 (810-1199px)**：
  - 左侧导航固定显示
  - 收藏夹卡片双列显示
- **桌面端 (1200px+)**：
  - 完整功能展示
  - 多列卡片布局

### 4.3 加载状态和错误处理
- **骨架屏**：收藏夹列表和项目列表加载时
- **空状态**：无收藏夹或无关注时的提示
- **错误状态**：网络错误或权限错误的友好提示
- **成功反馈**：创建、编辑、删除操作的成功提示

## 5. 数据模型

### 5.1 收藏夹表 (lists)
```typescript
interface List {
  id: number;
  name: string;
  description?: string;
  privacy: 'private' | 'public';
  creator: string; // 用户地址
  slug: string; // 唯一标识符
  followCount: number; // 关注者数量
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 收藏夹项目关联表 (listProjects)
```typescript
interface ListProject {
  id: number;
  listId: number;
  projectId: number;
  addedBy: string; // 添加者地址
  order: number; // 排序字段
  createdAt: Date;
}
```

### 5.3 收藏夹关注表 (listFollows)
```typescript
interface ListFollow {
  id: number;
  listId: number;
  userId: string; // 关注者地址
  createdAt: Date;
}
```

## 6. 验收标准

### 6.1 功能验收
- [ ] Profile 页面左侧导航正确显示
- [ ] My Lists 页面正确显示用户收藏夹和关注列表
- [ ] 创建收藏夹功能正常工作
- [ ] 编辑收藏夹功能正常工作
- [ ] 删除收藏夹功能正常工作
- [ ] 收藏夹详情页正确显示项目列表
- [ ] 项目拖拽排序功能正常
- [ ] 项目移除功能正常
- [ ] 分享收藏夹功能正常
- [ ] 关注/取消关注功能正常
- [ ] 私有收藏夹访问权限控制正常

### 6.2 性能验收
- [ ] 页面加载时间 < 2s
- [ ] 拖拽操作响应时间 < 100ms
- [ ] 分页滚动流畅无卡顿
- [ ] 图片懒加载正常

### 6.3 兼容性验收
- [ ] 桌面端 Chrome/Firefox/Safari 正常显示
- [ ] 移动端 iOS/Android 正常显示
- [ ] 响应式布局在各个断点正常

## 7. 开发计划

### 7.1 第一阶段：基础功能 (预计 5 天)
- Profile 页面重构 (左侧导航)
- My Lists 主页面开发
- 创建/编辑收藏夹弹窗
- 收藏夹列表展示

### 7.2 第二阶段：详情和管理 (预计 4 天)
- 收藏夹详情页开发
- 项目列表展示 (复用 ProjectCard)
- 项目管理功能 (拖拽排序、移除)
- 分页功能实现

### 7.3 第三阶段：分享和关注 (预计 3 天)
- 分享收藏夹功能
- 关注/取消关注功能
- 隐私权限控制
- 公开收藏夹页面

### 7.4 第四阶段：优化和测试 (预计 2 天)
- 响应式适配
- 性能优化
- 错误处理完善
- 全功能测试

## 8. 风险和注意事项

### 8.1 技术风险
- 拖拽功能在移动端的兼容性
- 大量项目时的性能问题
- 实时数据同步的复杂性

### 8.2 产品风险
- 用户对新导航布局的适应性
- 隐私设置的用户理解成本
- 分享链接的安全性

### 8.3 缓解措施
- 提供功能引导和帮助文档
- 实现渐进式加载和虚拟滚动
- 完善的错误处理和用户反馈机制