import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: "tari.js",
  tagline: "Your gateway to Tari L2",
  favicon: "img/favicon.png",
  
  organizationName: "tari-project",
  projectName: "tari.js",
  deploymentBranch: "documentation",
  trailingSlash: false,

  url: "https://tari-project.github.io/",
  baseUrl: "/tari.js",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          remarkPlugins: [[require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }]],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/meta-image.png",
    navbar: {
      title: "tari.js",
      logo: {
        alt: "Tari Logo",
        src: "img/tari-logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://github.com/tari-project/tari.js",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "tari.js",
          items: [
            {
              label: "Documentation",
              to: "/docs/",
            },
            {
              label: "Github",
              to: "https://github.com/tari-project/tari.js",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.com/invite/tari",
            },
            {
              label: "Telegram",
              href: "https://t.me/tariproject",
            },
            {
              label: "X",
              href: "https://x.com/tari",
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tari Labs.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["typescript", "javascript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
