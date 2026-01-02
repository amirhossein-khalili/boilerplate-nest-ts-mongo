FROM node:20-alpine AS builder

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install the dependencies and cache the Yarn cache to speed up future builds
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN yarn build

# Production Stage
FROM node:20-alpine AS production

# Set the working directory to /app
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install  --production

# Copy the built application
COPY --from=builder /app/dist ./dist

# Expose the port that the application will listen on
EXPOSE 5000

# Start the application
CMD ["node", "dist/main"]
