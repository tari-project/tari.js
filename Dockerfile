# Use Node.js 22.13.1 as the base image
FROM node:22.13.1-slim

# Set working directory
WORKDIR /app
# Add proto to PATH and set environment
ENV PATH="/root/.proto/bin:${PATH}"
ENV PROTO_HOME="/root/.proto"
ENV SHELL="/bin/bash"
# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@latest \
    && curl -fsSL https://moonrepo.dev/install/proto.sh | bash -s -- -y \
    && /bin/bash -c "source ~/.bashrc && source ~/.profile"


# Clone tari-dan repo at the same level (required for building)
WORKDIR /
RUN git clone https://github.com/tari-project/tari-dan.git

# Set up project
WORKDIR /app
COPY . .

# Use proto to set up the environment (with explicit shell sourcing)
SHELL ["/bin/bash", "-c"]
RUN proto use \
    && pnpm install \
    && moon tarijs:build

# Create combined dist directory and copy all dist folders while excluding node_modules
RUN mkdir -p /app/combined_dist && \
    for pkg in /app/packages/*/; do \
        if [ -d "${pkg}dist" ]; then \
            pkg_name=$(basename $pkg); \
            mkdir -p "/app/combined_dist/${pkg_name}/dist"; \
            cp -r "${pkg}dist/"* "/app/combined_dist/${pkg_name}/dist/"; \
            cp -r "${pkg}package.json" "/app/combined_dist/${pkg_name}/package.json"; \
            cp -r "${pkg}README.md" "/app/combined_dist/${pkg_name}/README.md"; \
        fi \
    done && \
    find /app/packages -name "node_modules" -type d -exec rm -rf {} +

# Set working directory to the combined dist
WORKDIR /app/combined_dist

# Set default command
CMD ["bash"] 