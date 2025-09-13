FROM node:18-alpine

WORKDIR /app

# Copy root package.json first
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy the entire project
COPY . .

# Change to backend directory and install backend dependencies
WORKDIR /app/college-club-backend
RUN npm install

# Go back to root and start the application
WORKDIR /app
EXPOSE 3000

CMD ["npm", "start"]
