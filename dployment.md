# Maple Intranet Deployment Guide

This guide covers how to deploy the Maple Intranet application. The architecture consists of a **Next.js** frontend deployed to Vercel, and a **FastAPI (Python)** backend deployed to Render. 

*Note: The codebase has already been refactored to use environment variables instead of hardcoded URLs, so you only need to configure the correct environment variables during deployment.*

---

## 1. Deploying Backend to Render

1. Create an account on [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository and select the `backend` root folder (or set the Root Directory to `backend` in settings).
4. **Environment Setup**:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt` (Make sure you generate a `requirements.txt` from your `venv` if you haven't).
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   Add the variables from your local `.env` file to the Render dashboard:
   - `DATABASE_URL` (You will need a production PostgreSQL database. Render offers managed PostgreSQL).
   - `OPENAI_API_KEY` (For the AI Assistant).
6. **Deploy**. Once successful, Render will give you a URL like `https://maple-backend.onrender.com`.

---

## 2. Deploying Frontend to Vercel

1. Create an account on [Vercel](https://vercel.com).
2. Click **Add New Project** and connect your GitHub repository.
3. **Framework Preset**: Next.js.
4. **Root Directory**: `frontend` (Important: Click edit and select your frontend folder).
5. **Environment Variables**:
   Add the following variables to match your backend and authentication configuration:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: (Your Clerk Publishable Key)
   - `CLERK_SECRET_KEY`: (Your Clerk Secret Key)
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`=`/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`=`/sign-up`
   - `NEXT_PUBLIC_API_URL`: `https://maple-backend.onrender.com` (The URL Render gave you).
   - `BACKEND_URL`: `https://maple-backend.onrender.com` (For `next.config.ts` rewrites).
6. **Deploy**. Vercel will build your application and assign a domain like `https://maple-intranet.vercel.app`.

---

## 3. Post-Deployment Steps

1. **Update Backend CORS Settings (`main.py`)**:
   Once Vercel gives you your frontend domain (e.g., `https://maple-intranet.vercel.app`), you must update `backend/app/main.py` to allow CORS requests from it.
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "https://maple-intranet.vercel.app" # <--- ADD YOUR VERCEL DOMAIN HERE
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
   Push this change to GitHub to trigger a redeploy on Render.

> [!TIP] 
> **Database Migrations**
> Don't forget to run your Alembic database migrations on the production Render database before testing the app! You can do this by running `alembic upgrade head` via Render's Web Shell.
