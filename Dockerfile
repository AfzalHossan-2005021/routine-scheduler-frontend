# Use the official Node.js image as the base image
FROM node:lts-alpine3.20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm update caniuse-lite browserslist
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object


# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]