# Use an official Node.js runtime as a parent image (Use version from env vars if specified, otherwise LTS)
# Render will likely use the NODE_VERSION environment variable you set (20)
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker cache for dependencies
COPY package*.json ./

# Install app dependencies
# Use --only=production if you don't need devDependencies
RUN npm install --only=production

# Bundle app source code inside Docker image
COPY . .

# Make port available to the world outside this container (Render provides PORT)
# EXPOSE $PORT is typically handled by Render automatically based on its env var

# Define environment variable (Optional: Render sets this, but good for clarity)
ENV NODE_ENV production

# Command to run the application
CMD [ "node", "server.js" ] 