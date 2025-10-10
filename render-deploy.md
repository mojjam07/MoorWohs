# Deploying Backend to Render

This guide provides step-by-step instructions to deploy the portfolio backend API to Render.

## Prerequisites

- A GitHub account
- A Render account (sign up at [render.com](https://render.com))
- Your code pushed to a GitHub repository

## Step 1: Prepare Your Codebase

1. Ensure your backend code is in a dedicated directory (e.g., `backend/`).
2. Update `config/config.js` to include your Render app URL in `CORS_ORIGINS` for production:
   ```javascript
   CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:5173', 'https://your-render-app-url.onrender.com']
   ```

## Step 2: Create a PostgreSQL Database on Render

1. Log in to your Render dashboard.
2. Click "New" > "PostgreSQL".
3. Choose a name for your database (e.g., `portfolio-db`).
4. Select a region and plan (free tier is available).
5. Click "Create Database".
6. Note down the connection details (you'll need the `DATABASE_URL`). 

## Step 3: Deploy the Web Service

1. In Render dashboard, click "New" > "Web Service".
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: Choose a name for your service (e.g., `portfolio-backend`)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)

## Step 4: Set Environment Variables

In your Render web service settings, add the following environment variables:

### Database Configuration
- `DATABASE_URL`: The full connection string from your PostgreSQL database (e.g., `postgresql://user:password@host:port/database`). This is the primary way to configure the database connection on Render.

### Authentication
- `JWT_SECRET`: A secure random string for JWT signing

### Email Configuration (for contact form)
- `EMAIL_HOST`: Your SMTP host (e.g., `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (e.g., `587`)
- `EMAIL_USER`: Your email username
- `EMAIL_PASS`: Your email password or app password
- `EMAIL_FROM`: The from email address
- `ADMIN_EMAIL`: Email to receive contact form submissions

### Cloudinary Configuration (for file uploads)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Optional
- `PORT`: Render sets this automatically, but you can override if needed

## Step 5: Deploy

1. Click "Create Web Service".
2. Render will build and deploy your application.
3. Monitor the build logs for any errors.
4. Once deployed, your API will be available at `https://your-service-name.onrender.com`.

## Step 6: Update Frontend

Update your frontend to point to the new backend URL:
- Change API base URLs from `http://localhost:5000` to `https://your-service-name.onrender.com`

## Troubleshooting

- **Build Failures**: Check the build logs. Common issues include missing environment variables or database connection problems.
- **Migration Errors**: Ensure your database is accessible and the schema is correct. If you see connection refused errors, verify that `DATABASE_URL` is set correctly in environment variables. If you see SSL/TLS required errors, the SSL configuration is handled automatically in the code.
- **CORS Issues**: Verify that your Render URL is added to `CORS_ORIGINS` in config.
- **Port Issues**: Render assigns a port via the `PORT` environment variable, which your app should use.

## Additional Notes

- Render's free tier has usage limits. Monitor your usage in the dashboard.
- For production, consider upgrading to a paid plan for better performance and uptime.
- Set up monitoring and logging as needed.
- If you need to redeploy after code changes, push to your GitHub repo and Render will auto-deploy (if enabled).
