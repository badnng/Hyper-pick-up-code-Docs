import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/Hyper-pick-up-code-Docs/',
  title: 'Docs',
  description: '文档站点',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' }
        ]
      }
    ]
  }
})
