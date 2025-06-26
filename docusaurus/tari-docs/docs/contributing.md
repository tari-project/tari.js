---
sidebar_position: 12
title: Contributing
description: Join the tari.js community! Learn how to contribute code, documentation, and ideas to make tari.js better for everyone.
---

# Contributing to tari.js 🤝

> **Welcome, builder!** We're thrilled you want to contribute to tari.js. Whether you're fixing bugs, adding features, improving docs, or sharing ideas — every contribution makes the Tari ecosystem stronger.

We welcome contributions to tari.js! This guide will help you get started with contributing to the project, whether you're fixing bugs, adding features, improving documentation, or helping with testing.

## 🌟 **Ways to Contribute**

### 🛠️ **Code Contributions**
- **🐛 Fix bugs** — Help resolve issues and improve stability
- **✨ Add features** — Implement new functionality and enhancements  
- **🔧 Optimize performance** — Make tari.js faster and more efficient
- **🧪 Write tests** — Improve code coverage and reliability

### 📚 **Documentation**
- **📝 Improve guides** — Make tutorials clearer and more helpful
- **📖 Add examples** — Show real-world usage patterns
- **🎥 Create tutorials** — Video guides and walkthroughs
- **🌐 Translate content** — Help make tari.js globally accessible

### 💡 **Ideas & Feedback**
- **💭 Share use cases** — Tell us how you're using tari.js
- **🗳️ Vote on features** — Help prioritize development  
- **🎯 Request features** — Suggest improvements and new capabilities
- **🐛 Report bugs** — Help us find and fix issues

## 🚀 Quick Start

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and **pnpm** installed
- **Git** for version control
- **tari-ootle** repository cloned at the same folder level as tari.js
- Basic knowledge of **TypeScript**, **React**, and **blockchain concepts**

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then:
   git clone https://github.com/YOUR-USERNAME/tari.js.git
   cd tari.js
   
   # Add upstream remote
   git remote add upstream https://github.com/tari-project/tari.js.git
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build the Project**
   ```bash
   moon tarijs:build
   ```

4. **Run Tests**
   ```bash
   moon :test
   ```

5. **Start Documentation Site**
   ```bash
   moon tari-docs:start
   ```

## 📋 Development Workflow

### Branch Strategy

We use a **feature branch workflow**:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-updates` - Documentation changes

### Creating a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...
git add .
git commit -m "feat: add new wallet integration"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(signer): add TariUniverse wallet integration
fix(provider): handle connection timeout properly
docs(api): update TransactionBuilder examples
test(integration): add end-to-end wallet tests
```

## 🛠️ Project Structure

### Monorepo Organization

```
tari.js/
├── packages/
│   ├── tarijs/                 # Main package (aggregates all functionality)
│   ├── tari_provider/          # Base provider interface
│   ├── tari_signer/            # Base signer interface
│   ├── indexer_provider/       # Indexer provider implementation
│   ├── wallet_daemon/          # Wallet daemon integration
│   ├── metamask_signer/        # MetaMask integration
│   ├── tari_universe/          # Tari Universe wallet integration
│   ├── walletconnect/          # WalletConnect integration
│   ├── builders/               # Transaction building utilities
│   ├── tarijs_types/           # Shared TypeScript types
│   └── tari_permissions/       # Permission system
├── docusaurus/                 # Documentation website
├── scripts/                    # Build and utility scripts
└── .github/                    # CI/CD workflows
```

### Package Development

Each package follows a consistent structure:

```
packages/package-name/
├── src/
│   ├── index.ts               # Public API exports
│   ├── types.ts               # Package-specific types
│   └── [implementation files]
├── test/
│   ├── unit-tests/            # Unit tests
│   └── integration-tests/     # Integration tests
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript configuration
└── moon.yml                   # Moon task configuration
```

## 🧪 Testing Guidelines

### Test Types

1. **Unit Tests** - Test individual functions and classes
2. **Integration Tests** - Test package interactions
3. **End-to-End Tests** - Test complete user workflows

### Writing Tests

We use **Vitest** for testing. Test files should be co-located with source files or in dedicated test directories.

```typescript
// Example unit test
import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionBuilder } from '../src/TransactionBuilder';

describe('TransactionBuilder', () => {
  let builder: TransactionBuilder;

  beforeEach(() => {
    builder = new TransactionBuilder(Network.LocalNet);
  });

  it('should set fee correctly', () => {
    const transaction = builder
      .fee(100)
      .build();

    expect(transaction.feeInstructions).toContain(
      expect.objectContaining({ amount: 100 })
    );
  });

  it('should throw on invalid fee amount', () => {
    expect(() => builder.fee(-1)).toThrow('Fee must be positive');
  });
});
```

### Integration Tests

```typescript
// Example integration test
import { describe, it, expect } from 'vitest';
import { WalletDaemonTariSigner, IndexerProvider } from '../src';

describe('Wallet Integration', () => {
  it('should connect to wallet daemon and submit transaction', async () => {
    const signer = new WalletDaemonTariSigner({
      endpoint: 'http://localhost:18103'
    });

    const provider = new IndexerProvider({
      endpoint: 'http://localhost:18300'
    });

    // Test connection
    expect(signer.isConnected()).toBe(true);
    
    // Test account retrieval
    const account = await signer.getAccount();
    expect(account.address).toMatch(/^account_[a-f0-9]{64}$/);

    // Test transaction submission
    const transaction = new TransactionBuilder()
      .fee(100)
      .createAccount(account.public_key)
      .build();

    const result = await signer.submitTransaction({ transaction });
    expect(result.transactionId).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
moon :test

# Run tests for specific package
moon wallet-daemon:test

# Run tests in watch mode
moon wallet-daemon:test -- --watch

# Run integration tests only
moon :test -- --run integration
```

## 📝 Documentation Guidelines

### Types of Documentation

1. **API Documentation** - Generated from TypeScript types and JSDoc
2. **User Guides** - Step-by-step tutorials and explanations
3. **Developer Documentation** - Architecture and contributing guides
4. **Code Comments** - Inline documentation for complex logic

### Writing Documentation

#### JSDoc Comments

```typescript
/**
 * Submits a transaction to the Tari network
 * 
 * @param request - Transaction request containing the transaction and options
 * @param request.transaction - The transaction to submit
 * @param request.is_dry_run - Whether to perform a dry run (default: false)
 * @returns Promise resolving to transaction submission result
 * 
 * @throws {ConnectionError} When the wallet is not connected
 * @throws {ValidationError} When the transaction is invalid
 * 
 * @example
 * ```typescript
 * const transaction = new TransactionBuilder()
 *   .fee(100)
 *   .callMethod(account, 'transfer', { amount: 1000, destination: 'account_...' })
 *   .build();
 * 
 * const result = await signer.submitTransaction({ transaction });
 * console.log('Transaction ID:', result.transactionId);
 * ```
 */
async submitTransaction(request: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
  // Implementation...
}
```

#### Markdown Documentation

Follow these guidelines for documentation:

- **Clear headings** with proper hierarchy
- **Code examples** for all API methods
- **Prerequisites** section for setup requirements
- **Troubleshooting** section for common issues
- **Cross-references** to related documentation

### Documentation Development

```bash
# Start documentation development server
moon tari-docs:start

# Build documentation
moon tari-docs:build

# Deploy documentation (maintainers only)
moon tari-docs:deploy
```

## 🔧 Code Style and Standards

### TypeScript Standards

- **Strict TypeScript** configuration enabled
- **Explicit types** for public APIs
- **Interface segregation** principle followed
- **Consistent naming** conventions

```typescript
// Good: Explicit types and clear naming
interface WalletConnectionConfig {
  endpoint: string;
  timeout?: number;
  retryAttempts?: number;
}

class WalletService {
  async connect(config: WalletConnectionConfig): Promise<TariSigner> {
    // Implementation with proper error handling
  }
}

// Avoid: Any types and unclear naming
class Service {
  async connect(config: any): Promise<any> {
    // Implementation
  }
}
```

### Code Formatting

We use **Prettier** for code formatting:

```bash
# Format all files
pnpm run format

# Check formatting
pnpm run format:check
```

### Linting

We use **ESLint** for code quality:

```bash
# Lint all files
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFileSync } from 'fs';

// 2. External packages
import React from 'react';
import { describe, it, expect } from 'vitest';

// 3. Internal packages (monorepo)
import { TariSigner } from '@tari-project/tari-signer';
import { TransactionBuilder } from '@tari-project/builders';

// 4. Relative imports
import { validateAddress } from '../utils/validation';
import { ConnectionError } from './errors';
```

## 🐛 Bug Reports and Feature Requests

### Reporting Bugs

When reporting bugs, include:

1. **Environment Information**
   - OS and browser version
   - Node.js and pnpm versions
   - tari.js version
   - Wallet type and version

2. **Clear Description**
   - What you expected to happen
   - What actually happened
   - Steps to reproduce

3. **Code Examples**
   - Minimal reproduction case
   - Error messages and stack traces

4. **Additional Context**
   - Screenshots or videos if applicable
   - Related issues or discussions

### Feature Requests

For feature requests, provide:

1. **Problem Statement** - What problem does this solve?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - What other solutions have you considered?
4. **Use Cases** - Specific scenarios where this would be useful

## 🔍 Code Review Process

### Submitting Pull Requests

1. **Create Feature Branch** from main
2. **Implement Changes** with tests and documentation
3. **Run Quality Checks**
   ```bash
   pnpm run lint
   pnpm run format:check
   moon :test
   moon :build
   ```
4. **Create Pull Request** with clear description
5. **Address Review Feedback** promptly

### Pull Request Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Criteria

Reviewers check for:

- **Functionality** - Does it work as intended?
- **Code Quality** - Is it maintainable and readable?
- **Performance** - Any performance implications?
- **Security** - Are there security considerations?
- **Documentation** - Is it properly documented?
- **Tests** - Are there adequate tests?

## 🏗️ Architecture Guidelines

### Design Principles

1. **Interface Segregation** - Small, focused interfaces
2. **Dependency Inversion** - Depend on abstractions, not concretions
3. **Single Responsibility** - Each class/function has one purpose
4. **Open/Closed** - Open for extension, closed for modification

### Adding New Wallet Integrations

To add a new wallet type:

1. **Create Package** in `packages/` directory
2. **Implement TariSigner** interface
3. **Add Configuration Types** for wallet-specific options
4. **Write Unit Tests** for all methods
5. **Add Integration Tests** with actual wallet
6. **Update Main Package** to export new signer
7. **Add Documentation** with usage examples

```typescript
// Example new signer implementation
export class NewWalletSigner implements TariSigner {
  readonly signerName = 'NewWallet';
  
  constructor(private config: NewWalletConfig) {
    // Initialize wallet connection
  }

  isConnected(): boolean {
    // Check connection status
  }

  async getAccount(): Promise<AccountData> {
    // Implement account retrieval
  }

  async submitTransaction(request: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    // Implement transaction submission
  }

  // ... implement other TariSigner methods
}
```

## 🤝 Community Guidelines

### Communication

- **Be respectful** and professional in all interactions
- **Ask questions** when you need clarification
- **Provide context** when reporting issues or requesting help
- **Be patient** with review processes and responses

### Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Discord** - Real-time chat with the community
- **Documentation** - Check existing docs before asking

### Recognition

Contributors are recognized through:

- **GitHub Contributors** page
- **Release Notes** acknowledgments
- **Community Highlights** in project updates

## 🚢 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for breaking changes
- **MINOR** version for new features
- **PATCH** version for bug fixes

### Release Workflow

1. **Feature Freeze** - No new features in release branch
2. **Testing Phase** - Comprehensive testing of release candidate
3. **Documentation Update** - Update all relevant documentation
4. **Release Notes** - Document all changes and breaking changes
5. **Publication** - Publish to npm registry
6. **Announcement** - Notify community of new release

## 📞 Contact and Support

### Maintainers

- **Core Team** - GitHub: @tari-project/tari-js-maintainers
- **Documentation** - Contributions welcome via GitHub

### Community

- **Discord** - [Tari Community Discord](https://discord.gg/tari)
- **GitHub Discussions** - [tari.js Discussions](https://github.com/tari-project/tari.js/discussions)
- **Twitter** - [@tari](https://twitter.com/tari)

### Reporting Security Issues

For security-related issues, please email: security@tari.com

Do not report security issues through public GitHub issues.

---

## 🎉 **Ready to Contribute?**

### 🚀 **Quick Start Checklist**
- [ ] [Set up development environment](#-quick-start)
- [ ] [Browse good first issues](https://github.com/tari-project/tari.js/labels/good%20first%20issue)
- [ ] [Join our Discord](https://discord.gg/tari) community
- [ ] [Read the project roadmap](https://github.com/tari-project/tari.js/blob/main/TODO.md)
- [ ] [Make your first contribution!](https://github.com/tari-project/tari.js/fork)

### 🏆 **Join Our Community of Builders**

**Thank you for contributing to tari.js!** Your efforts help make the Tari ecosystem more accessible and robust for everyone. Together, we're building the future of decentralized applications with privacy at the core.

- **🌟 Star the repo** to show your support
- **📢 Share tari.js** with fellow developers
- **💬 Connect with us** on Discord and GitHub
- **🚀 Build something amazing** and share it with the community

*Happy coding, and welcome to the Tari family!* 🎉
