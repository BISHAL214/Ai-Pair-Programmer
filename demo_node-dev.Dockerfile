
FROM node:20-alpine

# Install essential development tools
RUN apk add --no-cache bash git openssh nano curl tini

# Create non-root user for security[web:49][web:50]
ARG USER_ID=1001
ARG GROUP_ID=1001
RUN addgroup -g ${GROUP_ID} -S devuser && \
    adduser -u ${USER_ID} -S -G devuser devuser

# Create workspace directory with proper ownership
RUN mkdir -p /workspace && \
    chown devuser:devuser /workspace

# Set up environment
ENV SHELL=/bin/bash
ENV USER=devuser
ENV HOME=/home/devuser

# Switch to non-root user[web:50][web:53]
USER devuser
WORKDIR /workspace

# Keep container running for interactive use
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bash", "-lc", "while sleep 3600; do :; done"]

