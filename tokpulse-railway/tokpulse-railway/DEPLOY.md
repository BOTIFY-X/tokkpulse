# TokPulse — Railway Deployment

## Steps

1. Push this repo to GitHub
2. Create a new Railway project → Deploy from GitHub repo
3. Add a PostgreSQL plugin → DATABASE_URL auto-injected
4. Add one variable in Railway dashboard:
   - `OPENAI_API_KEY` → your OpenAI API key (get one at platform.openai.com)
5. All other variables are already baked into the Dockerfile

## Routes
- `/` → TokPulse web app
- `/api/*` → Express API
- `/admin` → Admin panel (password protected)
- `/terms` → Terms of Service
- `/privacy` → Privacy Policy

## Admin
Email: katsonofficial001@gmail.com
