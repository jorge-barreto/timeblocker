FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm install -g yarn && yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Serve the application
EXPOSE 5173
CMD ["yarn", "preview", "--host", "0.0.0.0"]