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

# The built files will be in the dist folder
WORKDIR /app/packages/tarijs
RUN rm -rf node_modules

# Set default command
CMD ["bash"] 