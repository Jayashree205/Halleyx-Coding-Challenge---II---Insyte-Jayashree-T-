# Use Node.js 18 (more stable for most React apps)
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files for server and client first
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
RUN cd server && npm install

# Install client dependencies
RUN cd client && npm install

# Copy all source files for both server and client
COPY server ./server
COPY client ./client

# Build React frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start backend
CMD ["node", "server/server.js"]