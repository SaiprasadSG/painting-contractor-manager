# Deployment Guide - Painting Contractor Manager

## Option 1: Deploy on Render (Recommended - Free/Paid)

### Backend Deployment (FastAPI on Render)

1. **Create Render Account**: https://render.com
2. **Push code to GitHub** (create repository)
3. **Create new Web Service on Render**:
   - Select Python as runtime
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `python server.py`
   - Add Environment Variables:
     - `MONGO_URL`: Your MongoDB connection string
4. **Deploy** - Render will auto-deploy on git push
5. **Get Backend URL** - e.g., `https://your-app.onrender.com`

### Frontend Deployment (React on Vercel)

1. **Create Vercel Account**: https://vercel.com
2. **Push code to GitHub**
3. **Import project in Vercel**:
   - Select `frontend` folder
   - Set Environment Variable:
     - `REACT_APP_API_URL`: Your Render backend URL
4. **Deploy** - Auto-deployed
5. **Get Frontend URL** - e.g., `https://your-app.vercel.app`

---

## Option 2: Deploy on Azure (Recommended for Production)

### Prerequisites:
- Azure Account
- Docker installed locally

### Backend on Azure App Service:
1. Create Container Registry
2. Push Docker image: `docker build -t yourapp/backend .`
3. Create App Service
4. Configure MongoDB connection string
5. Deploy from registry

### Frontend on Azure Static Web Apps:
1. Create Static Web App
2. Connect GitHub repository
3. Set build output folder: `build`
4. Deploy

---

## Option 3: Deploy on AWS (EC2/Elastic Beanstalk)

### Backend:
1. Create EC2 instance (Ubuntu)
2. Install Python, MongoDB
3. Clone repository
4. Run: `pip install -r requirements.txt`
5. Use PM2/Supervisor to keep running 24/7

### Frontend:
1. Build: `npm run build`
2. Deploy to S3 + CloudFront
3. Or use Elastic Beanstalk

---

## Option 4: Simple VPS Deployment (DigitalOcean/Linode)

### Setup:
1. Create VPS (Ubuntu 20.04)
2. SSH into server
3. Install Node.js, Python, MongoDB

### Backend:
```bash
cd /var/www/paint/backend
pip install -r requirements.txt
nohup python server.py > server.log 2>&1 &
```

### Frontend:
```bash
cd /var/www/paint/frontend
npm run build
npm install -g serve
nohup serve -s build -l 3000 > frontend.log 2>&1 &
```

### Keep Running:
Use PM2:
```bash
npm install -g pm2
pm2 start "python server.py" --name "backend"
pm2 start "serve -s build -l 3000" --name "frontend"
pm2 startup
pm2 save
```

---

## Quick Deploy Checklist:

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Backend API tested
- [ ] Frontend build tested
- [ ] Domain name registered (optional)
- [ ] SSL certificate configured
- [ ] Auto-restart setup (PM2 or Docker)
- [ ] Monitoring enabled
- [ ] Backups configured

---

## MongoDB Atlas (Cloud Database - Recommended)

Instead of local MongoDB:
1. Create account: https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Get connection string
4. Set `MONGO_URL` environment variable
5. Done! Database accessible from anywhere

---

## Recommended Stack for Production:

| Component | Service |
|-----------|---------|
| Backend | Render or Azure App Service |
| Frontend | Vercel or Azure Static Web Apps |
| Database | MongoDB Atlas |
| Domain | Namecheap or GoDaddy |
| SSL | Let's Encrypt (free) |

---

## Cost Estimate (Monthly):

- **Free Tier**: Render free tier + Vercel free + MongoDB Atlas free = ₹0
- **Basic**: Render ($7) + Vercel ($20) + MongoDB ($0 free) = ₹540
- **Production**: Azure ($50) + MongoDB Pro ($57) = ₹5000+

---

## Support:
- Render: https://docs.render.com
- Vercel: https://vercel.com/docs
- Azure: https://docs.microsoft.com/azure
- MongoDB: https://docs.mongodb.com

**Start with Render + Vercel + MongoDB Atlas - Easiest & Free!**
