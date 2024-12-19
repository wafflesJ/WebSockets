
# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of your app's code into the container
COPY . .

# Expose the port the app runs on (this is often 3000 for Node apps)
EXPOSE 3000

# Define the command to start the app
CMD ["npm", "start"]
