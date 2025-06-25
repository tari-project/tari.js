# tari.js Documentation Website 📚

> **Beautiful, comprehensive documentation for tari.js** — Built with Docusaurus for an exceptional developer experience.

This is the source for the official [tari.js documentation site](https://tari-project.github.io/tari.js/), providing comprehensive guides, tutorials, and API reference for building with tari.js.

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js 18+** and **pnpm** (recommended) or **yarn**
- **Git** for version control

### **Development Setup**

```bash
# Navigate to docs directory
cd docusaurus/tari-docs

# Install dependencies
pnpm install
# or
yarn install

# Start development server
pnpm start
# or  
yarn start
```

The development server will start at `http://localhost:3000/tari.js/` with live reload enabled.

## 🏗️ **Building & Deployment**

### **Local Build**

```bash
# Build static site
pnpm build
# or
yarn build
```

This generates static content in the `build/` directory that can be served by any static hosting service.

### **Production Deployment**

The documentation is automatically deployed to GitHub Pages via CI/CD when changes are merged to the main branch.

**Manual deployment** (maintainers only):

```bash
# Deploy to GitHub Pages
GIT_USER=<Your GitHub username> pnpm deploy
# or
GIT_USER=<Your GitHub username> yarn deploy
```

## 📁 **Documentation Structure**

```
docs/
├── index.md                    # Welcome page
├── installation.md             # Setup guide
├── provider-vs-signer.md       # Core concepts
├── guides/                     # Tutorials and guides
│   ├── getting-started-tutorial.md
│   └── production-deployment.md
├── signers/                    # Wallet integrations
│   ├── wallet-daemon.md
│   ├── metamask.md
│   ├── tari-universe.md
│   └── wallet-connect.md
├── wallet/                     # Transaction & account management
│   ├── submit-transaction/
│   └── template-definition.md
├── providers/                  # Data access
│   └── indexer-provider.md
├── api-reference.md           # Complete API docs
├── troubleshooting.md         # Common issues
└── contributing.md            # How to contribute
```

## ✍️ **Contributing to Documentation**

We welcome documentation improvements! Here's how to contribute:

### **Making Changes**

1. **Fork the repository** and create a feature branch
2. **Edit documentation files** in the `docs/` directory
3. **Test locally** using the development server
4. **Submit a pull request** with your improvements

### **Writing Guidelines**

- ✅ **Clear, concise language** — Write for developers of all experience levels
- ✅ **Practical examples** — Include working code snippets
- ✅ **Cross-references** — Link to related documentation
- ✅ **Consistent formatting** — Follow existing style patterns
- ✅ **Test code examples** — Ensure all code works as shown

### **Content Types**

| Type | Purpose | Location |
|------|---------|----------|
| **Tutorials** | Step-by-step learning | `guides/` |
| **How-to Guides** | Specific task solutions | `wallet/`, `signers/` |
| **Reference** | Complete API documentation | `api-reference.md` |
| **Explanation** | Concepts and architecture | `provider-vs-signer.md` |

## 🎨 **Customization**

### **Docusaurus Configuration**

The site is configured via `docusaurus.config.js`:

- **Theme settings** — Colors, fonts, layout
- **Plugin configuration** — Search, analytics, etc.
- **Navigation structure** — Sidebar and navbar
- **SEO settings** — Meta tags and social cards

### **Styling**

Custom styles are in `src/css/custom.css`:

```css
/* Example customization */
:root {
  --ifm-color-primary: #00d2ff;
  --ifm-color-primary-dark: #00bdee;
  /* ... more custom properties */
}
```

## 🧪 **Testing**

### **Link Checking**

```bash
# Check for broken links
pnpm run test:links
```

### **Build Testing**

```bash
# Test production build
pnpm build
pnpm serve
```

### **Accessibility**

```bash
# Run accessibility checks
pnpm run test:a11y
```

## 📈 **Analytics & SEO**

### **Search Optimization**

The site includes:
- ✅ **Algolia DocSearch** for fast site search
- ✅ **Meta tags** for social sharing
- ✅ **Structured data** for search engines
- ✅ **Sitemap generation** for better indexing

### **Performance**

- ✅ **Static site generation** for fast loading
- ✅ **Image optimization** for better performance
- ✅ **Progressive web app** features
- ✅ **Offline support** for documentation access

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .docusaurus build
pnpm install
pnpm build
```

#### **Port Conflicts**
```bash
# Use different port
pnpm start -- --port 3001
```

#### **Styling Issues**
```bash
# Clear browser cache
# Check custom.css for conflicts
# Restart development server
```

### **Getting Help**

- **📖 [Docusaurus Documentation](https://docusaurus.io/docs)**
- **💬 [tari.js Discussions](https://github.com/tari-project/tari.js/discussions)**
- **🐛 [Report Issues](https://github.com/tari-project/tari.js/issues)**

## 🌟 **Features**

This documentation site includes:

- **🔍 Instant Search** — Find content quickly with Algolia
- **🌙 Dark Mode** — Toggle between light and dark themes  
- **📱 Mobile Responsive** — Optimized for all devices
- **🔗 Social Sharing** — Share documentation easily
- **📊 Analytics** — Track usage and improve content
- **♿ Accessibility** — WCAG 2.1 AA compliant
- **🚀 Fast Loading** — Optimized performance
- **📧 Edit Suggestions** — Easy contribution workflow

---

**Built with ❤️ using [Docusaurus](https://docusaurus.io/)** | **Hosted on [GitHub Pages](https://pages.github.com/)**
