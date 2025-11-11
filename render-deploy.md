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

## Step 2: Create a Supabase Project

1. Sign up for a Supabase account at [supabase.com](https://supabase.com).
2. Create a new project.
3. Choose a name for your project (e.g., `portfolio-db`).
4. Select a region and database password.
5. Wait for the project to be set up.
6. Go to Settings > API in your Supabase dashboard.
7. Note down the `Project URL` and `anon public` key (you'll need these for `SUPABASE_URL` and `SUPABASE_ANON_KEY`).

## Step 3: Deploy the Web Service

1. In Render dashboard, click "New" > "Web Service".
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: Choose a name for your service (e.g., `portfolio-backend`)
   - **Environment**: Node
- **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)

## Step 4: Set Environment Variables

In your Render web service settings, add the following environment variables:

### Supabase Configuration
- `SUPABASE_URL`: The Project URL from your Supabase project (e.g., `https://your-project-id.supabase.co`)
- `SUPABASE_ANON_KEY`: The anon public key from your Supabase project

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
- **Migration Errors**: Ensure your Supabase project is set up correctly and the schema is created. Use the Supabase dashboard to create tables and run migrations.
- **CORS Issues**: Verify that your Render URL is added to `CORS_ORIGINS` in config.
- **Port Issues**: Render assigns a port via the `PORT` environment variable, which your app should use.

## Step 7: Create Database Schema in Supabase

1. Go to your Supabase project dashboard.
2. Navigate to the SQL Editor.
3. Run the SQL commands from `backend/db/schema.sql` to create your tables.
4. Optionally, run the migration script from `backend/db/migrate.js` to populate initial data.

## Additional Notes

- Render's free tier has usage limits. Monitor your usage in the dashboard.
- For production, consider upgrading to a paid plan for better performance and uptime.
- Set up monitoring and logging as needed.
- If you need to redeploy after code changes, push to your GitHub repo and Render will auto-deploy (if enabled).
