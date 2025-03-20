# Use Node.js 22.13.1 as the base image
FROM node:22.13.1-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@latest

# Install and initialize proto CLI
RUN curl -fsSL https://moonrepo.dev/install/proto.sh | bash -s -- -y && \
    /bin/bash -c "source ~/.bashrc && source ~/.profile"

# Add proto to PATH and set environment
ENV PATH="/root/.proto/bin:${PATH}"
ENV PROTO_HOME="/root/.proto"
ENV SHELL="/bin/bash"

# Clone tari-dan repo at the same level (required for building)
WORKDIR /
RUN git clone https://github.com/tari-project/tari-dan.git

# Set up project
WORKDIR /app
COPY . .

# Use proto to set up the environment (with explicit shell sourcing)
SHELL ["/bin/bash", "-c"]
RUN source ~/.profile && proto use

# Install dependencies using pnpm (proto will ensure correct version)
RUN pnpm install

# Build the library using moon
RUN moon tarijs:build

# The built files will be in the dist folder
WORKDIR /app/packages/tarijs/dist

# Set default command
CMD ["bash"] 