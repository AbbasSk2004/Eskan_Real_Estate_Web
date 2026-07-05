# ESKAN Real Estate Platform

[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern real estate platform composed of a React web client, an admin dashboard, and a Node.js backend. The application now runs on MongoDB as the source of truth and uses JWT-based authentication for secure user access across the experience.

## Core Capabilities

- Property discovery with advanced filtering and search
- User registration, login, and profile management
- Agent listings and property inquiry workflows
- Responsive browsing experience for desktop and mobile
- Content areas such as blogs, testimonials, and FAQs
- Admin tools for managing listings, users, and platform content

## Technology Stack

- Frontend: React.js, React Router, Bootstrap 5, Context API
- Backend: Express.js, MongoDB, Mongoose
- Authentication: JWT bearer tokens
- Media handling: Cloudinary
- Real-time communication: WebSocket support
- Deployment: Docker, Nginx, and Netlify-ready builds

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- MongoDB instance (local or cloud)
- Docker and Docker Compose (optional, for containerized deployment)

### Environment Variables

Create a `.env` file in the project root for frontend configuration:

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

For the backend, configure the environment in the `backend` directory:

```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/eskan
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AbbasSk2004/ESKAN_Real_Estate.git
   cd ESKAN_Real_Estate
   ```
2. Install dependencies for the web app and backend:
   ```bash
   npm run install-all
   ```
3. Start the development stack:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:3000`

## Project Structure

```text
src/                   # React frontend
public/                # Static assets
backend/               # Express + MongoDB API services
admin-panel/           # Administrative web dashboard
real_estate/           # React Native mobile application
```

## Deployment

### Production Backend

The platform is configured to use the production backend at:

```text
https://eskan-real-estate-backend.onrender.com
```

### Docker Compose

```bash
docker-compose up --build -d
```

### Netlify Deployment

The web frontend is compatible with Netlify deployment and uses the provided `netlify.toml` configuration.

## Troubleshooting

- CORS issues usually indicate a mismatch between the frontend origin and backend CORS configuration.
- Authentication errors are commonly caused by an invalid or missing JWT secret.
- Image upload failures typically point to missing Cloudinary credentials.
- If a build unexpectedly fails, remove local dependencies and reinstall them.

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
