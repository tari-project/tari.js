---
sidebar_position: 3
title: Production Deployment
description: Deploy tari.js applications to production with confidence - security, performance, and monitoring best practices
---

# Production Deployment Guide 🚀

> **Ship with confidence** — Comprehensive guide to deploying tari.js applications in production environments with enterprise-grade security, performance, and reliability.

This guide covers everything you need to deploy tari.js applications safely and efficiently in production, from security hardening to performance optimization and monitoring.

## 🎯 **Pre-Deployment Checklist**

### **Security Audit**
- [ ] **No hardcoded secrets** — All sensitive data in environment variables
- [ ] **HTTPS enforced** — SSL/TLS certificates properly configured
- [ ] **Input validation** — All user inputs properly sanitized
- [ ] **Error handling** — No sensitive information in error messages
- [ ] **Dependency audit** — All packages scanned for vulnerabilities
- [ ] **Wallet permissions** — Minimal required permissions only

### **Performance Optimization**
- [ ] **Bundle analysis** — Bundle size optimized and analyzed
- [ ] **Code splitting** — Dynamic imports for wallet modules
- [ ] **Asset optimization** — Images and assets compressed
- [ ] **Caching strategy** — Proper cache headers configured
- [ ] **CDN setup** — Static assets served via CDN
- [ ] **Connection pooling** — Efficient wallet connection management

### **Testing & Quality**
- [ ] **Test coverage >90%** — Comprehensive test suite
- [ ] **E2E tests passing** — End-to-end user workflows tested
- [ ] **Load testing** — Performance under expected traffic
- [ ] **Security testing** — Penetration testing completed
- [ ] **Cross-browser testing** — Compatibility verified
- [ ] **Mobile testing** — Responsive design validated

## 🔒 **Security Best Practices**

### **Environment Configuration**

```bash
# Production environment variables
NODE_ENV=production
TARI_NETWORK=mainnet
TARI_INDEXER_URL=https://your-secure-indexer.example.com
TARI_WALLET_DAEMON_URL=wss://your-secure-daemon.example.com

# Security headers
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true
CORS_ORIGIN=https://yourdomain.com
```

### **Content Security Policy (CSP)**

```html
<!-- Strict CSP for production -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' wss: https: ws:;
        img-src 'self' data: https:;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      ">
```

### **Secure Wallet Configuration**

```typescript
// Production wallet configuration
const secureWalletConfig = {
  // Network configuration
  network: 'mainnet',
  
  // Connection security
  enforceHttps: true,
  validateCertificates: true,
  connectionTimeout: 30000,
  
  // Authentication
  requirePermissions: true,
  permissionWhitelist: [
    'accounts:read',
    'transactions:submit',
    'substates:read'
  ],
  
  // Error handling
  sanitizeErrors: true,
  hideStackTraces: true,
  
  // Rate limiting
  maxRequestsPerMinute: 60,
  burstLimit: 10,
  
  // Monitoring
  enableAuditLog: true,
  logLevel: 'info'
};
```

### **API Security**

```typescript
// Secure API wrapper with rate limiting
export class SecureWalletAPI {
  private rateLimiter: RateLimiter;
  private auditLogger: AuditLogger;
  
  constructor(config: SecureWalletConfig) {
    this.rateLimiter = new RateLimiter({
      max: config.maxRequestsPerMinute,
      windowMs: 60000
    });
    
    this.auditLogger = new AuditLogger({
      level: config.logLevel,
      destination: config.auditLogPath
    });
  }
  
  async submitTransaction(transaction: Transaction): Promise<TransactionResult> {
    // Rate limiting
    await this.rateLimiter.check();
    
    // Input validation
    this.validateTransaction(transaction);
    
    // Audit logging
    this.auditLogger.log('transaction_submit', {
      transactionId: transaction.id,
      userId: this.getCurrentUserId(),
      timestamp: new Date().toISOString()
    });
    
    try {
      return await this.signer.submitTransaction({ transaction });
    } catch (error) {
      // Sanitize error for client
      throw this.sanitizeError(error);
    }
  }
  
  private validateTransaction(transaction: Transaction): void {
    if (!transaction || !transaction.instructions) {
      throw new ValidationError('Invalid transaction structure');
    }
    
    // Additional validation logic
  }
  
  private sanitizeError(error: Error): Error {
    // Remove sensitive information from error messages
    return new Error('Transaction failed. Please try again.');
  }
}
```

## ⚡ **Performance Optimization**

### **Bundle Optimization**

```typescript
// webpack.config.js for production
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate tari.js chunks for better caching
        tari: {
          test: /[\\/]node_modules[\\/]@tari-project[\\/]/,
          name: 'tari',
          chunks: 'all',
          priority: 10
        },
        
        // Wallet-specific chunks
        wallets: {
          test: /[\\/]node_modules[\\/]@tari-project[\\/](wallet-daemon|metamask-signer|tari-universe)[\\/]/,
          name: 'wallets',
          chunks: 'async',
          priority: 20
        }
      }
    },
    
    // Tree shaking
    usedExports: true,
    sideEffects: false
  },
  
  plugins: [
    // Analyze bundle size
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true
    })
  ]
};
```

### **Dynamic Wallet Loading**

```typescript
// Lazy load wallet modules for better performance
export class WalletManager {
  private walletCache = new Map<string, any>();
  
  async loadWallet(type: WalletType): Promise<TariSigner> {
    if (this.walletCache.has(type)) {
      return this.walletCache.get(type);
    }
    
    let WalletClass;
    
    switch (type) {
      case 'metamask':
        const { MetaMaskSigner } = await import('@tari-project/metamask-signer');
        WalletClass = MetaMaskSigner;
        break;
        
      case 'wallet-daemon':
        const { WalletDaemonSigner } = await import('@tari-project/wallet-daemon');
        WalletClass = WalletDaemonSigner;
        break;
        
      case 'tari-universe':
        const { TariUniverseSigner } = await import('@tari-project/tari-universe');
        WalletClass = TariUniverseSigner;
        break;
        
      default:
        throw new Error(`Unsupported wallet type: ${type}`);
    }
    
    const wallet = new WalletClass(this.getWalletConfig(type));
    this.walletCache.set(type, wallet);
    
    return wallet;
  }
}
```

### **Connection Pooling**

```typescript
// Efficient connection management
export class ConnectionPool {
  private connections = new Map<string, Connection>();
  private maxConnections = 10;
  private connectionTimeout = 30000;
  
  async getConnection(endpoint: string): Promise<Connection> {
    const existing = this.connections.get(endpoint);
    
    if (existing && existing.isHealthy()) {
      return existing;
    }
    
    if (this.connections.size >= this.maxConnections) {
      await this.cleanupStaleConnections();
    }
    
    const connection = await this.createConnection(endpoint);
    this.connections.set(endpoint, connection);
    
    return connection;
  }
  
  private async cleanupStaleConnections(): Promise<void> {
    for (const [endpoint, connection] of this.connections) {
      if (!connection.isHealthy()) {
        await connection.close();
        this.connections.delete(endpoint);
      }
    }
  }
}
```

## 🏗️ **Infrastructure Setup**

### **Docker Production Build**

```dockerfile
# Multi-stage production build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security headers
RUN echo 'add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/security.conf
RUN echo 'add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/security.conf
RUN echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;' >> /etc/nginx/conf.d/security.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### **Nginx Configuration**

```nginx
# nginx.conf for production
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Serve static files
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass https://your-backend-api.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket proxy for wallet daemon
    location /ws/ {
        proxy_pass wss://your-wallet-daemon.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # SPA fallback
    try_files $uri $uri/ /index.html;
}
```

### **Kubernetes Deployment**

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tari-js-app
  labels:
    app: tari-js-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tari-js-app
  template:
    metadata:
      labels:
        app: tari-js-app
    spec:
      containers:
      - name: tari-js-app
        image: your-registry/tari-js-app:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: TARI_NETWORK
          value: "mainnet"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: tari-js-service
spec:
  selector:
    app: tari-js-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tari-js-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: tari-js-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tari-js-service
            port:
              number: 80
```

## 📊 **Monitoring & Observability**

### **Health Checks**

```typescript
// Comprehensive health check system
export class HealthChecker {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkWalletConnectivity(),
      this.checkIndexerConnectivity(),
      this.checkDatabaseHealth(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]);
    
    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        wallet: checks[0].status === 'fulfilled',
        indexer: checks[1].status === 'fulfilled',
        database: checks[2].status === 'fulfilled',
        memory: checks[3].status === 'fulfilled',
        disk: checks[4].status === 'fulfilled'
      }
    };
  }
  
  private async checkWalletConnectivity(): Promise<boolean> {
    try {
      const signer = new WalletDaemonSigner(this.config.wallet);
      return signer.isConnected();
    } catch {
      return false;
    }
  }
  
  private async checkIndexerConnectivity(): Promise<boolean> {
    try {
      const provider = new IndexerProvider(this.config.indexer);
      await provider.getNetworkInfo();
      return true;
    } catch {
      return false;
    }
  }
}
```

### **Metrics Collection**

```typescript
// Prometheus metrics
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsCollector {
  private transactionCounter = new Counter({
    name: 'tari_transactions_total',
    help: 'Total number of transactions processed',
    labelNames: ['wallet_type', 'status']
  });
  
  private transactionDuration = new Histogram({
    name: 'tari_transaction_duration_seconds',
    help: 'Transaction processing duration',
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });
  
  private walletConnections = new Gauge({
    name: 'tari_wallet_connections_active',
    help: 'Number of active wallet connections'
  });
  
  recordTransaction(walletType: string, status: string, duration: number): void {
    this.transactionCounter.inc({ wallet_type: walletType, status });
    this.transactionDuration.observe(duration);
  }
  
  updateConnectionCount(count: number): void {
    this.walletConnections.set(count);
  }
  
  getMetrics(): string {
    return register.metrics();
  }
}
```

### **Error Tracking**

```typescript
// Sentry error tracking
import * as Sentry from '@sentry/node';

export class ErrorTracker {
  constructor() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      beforeSend: this.sanitizeErrorData
    });
  }
  
  captureException(error: Error, context?: any): void {
    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('additional', context);
      }
      scope.setTag('component', 'tari-wallet');
      Sentry.captureException(error);
    });
  }
  
  private sanitizeErrorData(event: Sentry.Event): Sentry.Event {
    // Remove sensitive information from error reports
    if (event.exception?.values) {
      event.exception.values.forEach(exception => {
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames.forEach(frame => {
            // Remove local file paths
            if (frame.filename?.includes('/home/')) {
              frame.filename = frame.filename.replace(/\/home\/[^\/]+/, '/home/user');
            }
          });
        }
      });
    }
    
    return event;
  }
}
```

## 🔍 **Logging Strategy**

### **Structured Logging**

```typescript
// Winston structured logging
import winston from 'winston';

export class Logger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'tari-wallet-app',
        version: process.env.APP_VERSION
      },
      transports: [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        })
      ]
    });
    
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }
  
  logTransaction(transactionId: string, walletType: string, userId?: string): void {
    this.logger.info('Transaction processed', {
      transactionId,
      walletType,
      userId: userId ? this.hashUserId(userId) : 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
  
  logError(error: Error, context?: any): void {
    this.logger.error('Application error', {
      error: error.message,
      stack: error.stack,
      context: this.sanitizeContext(context)
    });
  }
  
  private hashUserId(userId: string): string {
    // Hash user ID for privacy
    return require('crypto').createHash('sha256').update(userId).digest('hex').slice(0, 8);
  }
  
  private sanitizeContext(context: any): any {
    // Remove sensitive fields from log context
    if (!context) return context;
    
    const sanitized = { ...context };
    delete sanitized.privateKey;
    delete sanitized.password;
    delete sanitized.token;
    
    return sanitized;
  }
}
```

## 🚨 **Incident Response**

### **Alerting Configuration**

```yaml
# Prometheus alerting rules
groups:
- name: tari-wallet-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(tari_transactions_total{status="error"}[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High transaction error rate detected"
      description: "Error rate is {{ $value }} per second"
      
  - alert: WalletConnectionDown
    expr: tari_wallet_connections_active == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "No active wallet connections"
      description: "All wallet connections are down"
      
  - alert: HighMemoryUsage
    expr: process_resident_memory_bytes > 500000000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is {{ $value | humanize }}B"
```

### **Automated Recovery**

```typescript
// Circuit breaker for wallet connections
export class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

## 📈 **Performance Monitoring**

### **Real User Monitoring (RUM)**

```typescript
// Performance tracking
export class PerformanceMonitor {
  trackWalletConnection(walletType: string): void {
    const startTime = performance.now();
    
    return {
      complete: () => {
        const duration = performance.now() - startTime;
        this.sendMetric('wallet_connection_time', duration, {
          wallet_type: walletType
        });
      }
    };
  }
  
  trackTransactionSubmission(transactionSize: number): void {
    const startTime = performance.now();
    
    return {
      complete: (success: boolean) => {
        const duration = performance.now() - startTime;
        this.sendMetric('transaction_submission_time', duration, {
          transaction_size: transactionSize.toString(),
          success: success.toString()
        });
      }
    };
  }
  
  private sendMetric(name: string, value: number, tags: Record<string, string>): void {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        custom_parameter: value,
        ...tags
      });
    }
  }
}
```

## 🔄 **Continuous Deployment**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run tests
      run: pnpm test
    
    - name: Run security audit
      run: pnpm audit
    
    - name: Build application
      run: pnpm build
    
    - name: Run E2E tests
      run: pnpm test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Build for production
      run: pnpm build
      env:
        NODE_ENV: production
        TARI_NETWORK: mainnet
    
    - name: Build Docker image
      run: |
        docker build -t ${{ secrets.DOCKER_REGISTRY }}/tari-js-app:${{ github.sha }} .
        docker tag ${{ secrets.DOCKER_REGISTRY }}/tari-js-app:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/tari-js-app:latest
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login ${{ secrets.DOCKER_REGISTRY }} -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push ${{ secrets.DOCKER_REGISTRY }}/tari-js-app:${{ github.sha }}
        docker push ${{ secrets.DOCKER_REGISTRY }}/tari-js-app:latest
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/tari-js-app tari-js-app=${{ secrets.DOCKER_REGISTRY }}/tari-js-app:${{ github.sha }}
        kubectl rollout status deployment/tari-js-app
    
    - name: Verify deployment
      run: |
        kubectl get pods -l app=tari-js-app
        curl -f https://yourdomain.com/health
```

## 🎯 **Production Checklist**

### **Final Pre-Launch Verification**

- [ ] **Load testing completed** — Application handles expected traffic
- [ ] **Security scan passed** — No critical vulnerabilities
- [ ] **Monitoring configured** — Alerts and dashboards ready
- [ ] **Backup strategy** — Data backup and recovery procedures
- [ ] **Rollback plan** — Procedures for quick rollback if needed
- [ ] **Documentation updated** — Runbooks and operational guides
- [ ] **Team training** — Operations team familiar with deployment
- [ ] **Compliance check** — Legal and regulatory requirements met

### **Go-Live Protocol**

1. **Deploy during low-traffic period**
2. **Monitor metrics closely for first 24 hours**
3. **Verify all critical user journeys**
4. **Check error rates and performance**
5. **Confirm monitoring and alerting**
6. **Document any issues and resolutions**

## 🔗 **Related Resources**

- **[Installation Guide](../installation)** — Development environment setup
- **[Security Best Practices](../security-guide)** — Comprehensive security checklist
- **[Performance Optimization](../performance-guide)** — Advanced optimization techniques
- **[Monitoring Guide](../monitoring-guide)** — Complete observability setup
- **[Troubleshooting](../troubleshooting)** — Common production issues

## 💬 **Support**

- **🚨 [Emergency Support](mailto:emergency@tari.com)** — Critical production issues
- **💬 [Discord](https://discord.gg/tari)** — Community support and discussion
- **📋 [Issue Tracker](https://github.com/tari-project/tari.js/issues)** — Bug reports and feature requests
- **📚 [Documentation](https://tari-project.github.io/tari.js/)** — Complete guides and references

---

**Ready for production?** Follow this guide step-by-step to deploy your tari.js application with enterprise-grade reliability and security! 🚀
