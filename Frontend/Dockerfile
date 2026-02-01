# Stage 1: Build
FROM node:18 AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Set npm registry explicitly + clean cache
RUN npm config set registry https://registry.npmjs.org/ \
    && npm cache clean --force \
    && npm install --legacy-peer-deps

# Copy rest of the app
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
