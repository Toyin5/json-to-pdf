# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port the app will run on
EXPOSE 8080

# Command to run the application
CMD ["npm", "dev"]
