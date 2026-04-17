# Use official Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy full project
COPY . .

# Expose port
EXPOSE 8080

# Start app
CMD ["node", "src/app.js"]
