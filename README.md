# 幸运转盘

## 演示站
[https://food.hauchet.cn](https://food.hauchet.cn)

## 项目介绍

幸运转盘是一个基于 Vue 3 和 Element Plus 开发的互动应用，用于随机选择决策选项。用户可以添加、编辑和管理选项，通过旋转转盘来随机选择一个结果，并查看历史记录。

## 功能特点

- **可视化转盘**：美观的旋转动画和色彩设计
- **选项管理**：
    - 添加、编辑、删除选项
    - 自定义转盘名称
- **历史记录**：记录每次转盘结果和时间
- **数据导入导出**：支持 JSON 格式保存和恢复数据
- **本地存储**：自动保存设置和历史记录到浏览器
- **响应式设计**：适配桌面和移动设备

## 技术栈

- Vue 3 (Composition API)
- Element Plus UI 组件库
- Canvas API 绘制转盘
- Vite 构建工具
- 本地存储 (localStorage)

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 使用指南

1. **添加选项**：
    - 在"转盘选项管理"区域输入选项名称并点击"添加"
    - 可以编辑或删除已添加的选项

2. **旋转转盘**：
    - 点击"开始旋转"按钮
    - 等待转盘停止后显示结果

3. **查看历史记录**：
    - 在"历史记录"区域查看过去的转盘结果和时间
    - 可以点击"清空"按钮删除所有历史记录

4. **定制转盘**：
    - 点击"重命名"按钮更改转盘标题
    - 通过"导出"和"导入"按钮备份或恢复设置
    - 点击"重置"恢复默认选项

## 项目截图

![转盘截图](shortcut.png)

## 项目结构

```
luckywheel/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── components/  # 组件
│   │   └── LuckyWheel.vue  # 转盘组件
│   ├── App.vue      # 主应用组件
│   ├── main.js      # 入口文件
│   └── style.css    # 全局样式
├── index.html       # HTML 模板
└── vite.config.js   # Vite 配置
```

## 贡献

欢迎提交 Issues 和 Pull Requests。

## 许可证

基于Apache-2.0 license开源

## 联系方式

如有问题或建议，请访问 [亡灵的网站](https://wangling.hauchet.cn) 获取更多信息。
