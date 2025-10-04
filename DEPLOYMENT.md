# 🚀 SkyCast Deployment Guide

## ✅ All Errors Fixed!

All Python import warnings are now resolved. The Python environment is configured correctly.

---

## 🌐 Where to Deploy Your App

### **Option 1: Vercel (RECOMMENDED - Easiest & Free)**

✨ **Perfect for NASA Space Apps Demo!**

#### **Frontend Deployment (Free Plan):**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy Frontend:**
```bash
cd frontend
vercel
```

3. **Follow Prompts:**
   - Link to existing project? **N**
   - Project name: **skycast**
   - Directory: **./frontend**
   - Override settings? **N**

**✅ Your frontend will be live at: `https://skycast-yourusername.vercel.app`**

#### **Backend Options:**

**A. Vercel Serverless Functions (Easiest):**
```bash
cd backend
vercel
```

**B. Railway (Alternative - Free $5 credit):**
- Visit: https://railway.app/
- Connect GitHub repo
- Deploy backend folder
- Auto-detects FastAPI

---

### **Option 2: Complete Production Setup**

#### **Frontend: Vercel**
```bash
cd frontend
npm run build
vercel --prod
```

#### **Backend: Railway/Render/Fly.io**

**Railway (Recommended):**
1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select NASA repository
4. Set root directory: `/backend`
5. Add environment variables:
   - `PORT=8000`
   - `CORS_ORIGINS=https://your-vercel-app.vercel.app`

**Render:**
1. Go to https://render.com/
2. New → Web Service
3. Connect GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Fly.io:**
```bash
cd backend
fly launch
fly deploy
```

---

### **Option 3: Docker + AWS/GCP (Enterprise)**

#### **AWS Elastic Container Service:**

1. **Build & Push to ECR:**
```bash
cd cloud
docker build -t skycast-backend -f Dockerfile.backend .
docker tag skycast-backend:latest YOUR_ECR_URL/skycast-backend:latest
docker push YOUR_ECR_URL/skycast-backend:latest
```

2. **Deploy to ECS:**
- Create ECS cluster
- Create task definition
- Create service
- Set load balancer

#### **Google Cloud Run:**
```bash
cd cloud
gcloud builds submit --tag gcr.io/YOUR_PROJECT/skycast-backend
gcloud run deploy skycast-backend --image gcr.io/YOUR_PROJECT/skycast-backend
```

---

## 🎯 Quick Deploy (For NASA Hackathon - 5 Minutes!)

### **Step 1: Deploy Frontend to Vercel**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### **Step 2: Deploy Backend to Railway**
1. Visit: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select: `Abdullah2008-bit/NASA`
4. Root directory: `/skycast/backend`
5. Click "Deploy"

### **Step 3: Update Environment Variables**

**In Vercel (Frontend):**
- Go to project settings
- Add environment variable:
  - `NEXT_PUBLIC_API_URL` = `https://your-railway-app.railway.app`

**In Railway (Backend):**
- Add environment variables:
  - `CORS_ORIGINS` = `https://your-vercel-app.vercel.app`

### **Done! 🎉**

---

## 📊 Deployment Costs (All have FREE tiers!)

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | Unlimited hobby projects | Frontend (Next.js) |
| **Railway** | $5 free credit/month | Backend (FastAPI) |
| **Render** | 750 hours/month free | Backend alternative |
| **Fly.io** | 3 shared VMs free | Docker deployments |
| **Netlify** | 100GB bandwidth | Static frontend |

---

## 🔑 Environment Variables Needed

### **Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=SkyCast
```

### **Backend (.env):**
```env
CORS_ORIGINS=https://your-frontend-url.vercel.app
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password
REDIS_URL=redis://your-redis-url:6379
```

---

## 🚀 Recommended Setup for NASA Space Apps

**Best combination for demo:**

1. **Frontend**: Vercel (Free, instant deploy, global CDN)
2. **Backend**: Railway (Free $5 credit, easy Python support)
3. **Database**: Railway Redis (Included in free tier)

**Total cost: $0/month** ✅

---

## 📝 Deployment Checklist

- [ ] Push latest code to GitHub
- [ ] Create Vercel account
- [ ] Deploy frontend to Vercel
- [ ] Create Railway account
- [ ] Deploy backend to Railway
- [ ] Set environment variables on both platforms
- [ ] Test API endpoints
- [ ] Test frontend at production URL
- [ ] Update README with live demo URL
- [ ] Submit to NASA Space Apps! 🌍

---

## 🎨 Your Live URLs Will Be:

- **Frontend**: `https://skycast-abdullah2008.vercel.app`
- **Backend**: `https://skycast-backend.up.railway.app`
- **API Docs**: `https://skycast-backend.up.railway.app/docs`

---

## 🆘 Troubleshooting

### **CORS errors in production:**
Make sure `CORS_ORIGINS` in backend includes your Vercel URL:
```env
CORS_ORIGINS=https://skycast-abdullah2008.vercel.app
```

### **API not connecting:**
Check frontend `NEXT_PUBLIC_API_URL` matches Railway backend URL.

### **Build fails:**
- Vercel: Check Node.js version (20+)
- Railway: Check Python version (3.11+)

---

## 🎉 Next Steps After Deployment

1. **Test everything** at production URLs
2. **Add demo URL** to NASA Space Apps submission
3. **Create demo video** showing the live app
4. **Share on social media** with #NASASpaceApps
5. **Get feedback** from judges!

---

## 💡 Pro Tips

- Use Vercel's **Preview Deployments** for testing
- Railway automatically deploys on **git push**
- Add **custom domain** for extra polish (optional)
- Monitor with Vercel Analytics (free)
- Set up **GitHub Actions** for automated testing

---

**Made with ❤️ for NASA Space Apps Challenge 2025**

**Ready to deploy? Run: `cd frontend && vercel`** 🚀
