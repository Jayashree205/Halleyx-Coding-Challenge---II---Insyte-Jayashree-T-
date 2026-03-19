# Use Node image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for both server and client
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
RUN cd server && npm install

# Install client dependencies
RUN cd client && npm install && npm run build

# Copy all source files
COPY . .

# Expose the port
EXPOSE 5000

# Start the backend
CMD ["node", "server/server.js"]