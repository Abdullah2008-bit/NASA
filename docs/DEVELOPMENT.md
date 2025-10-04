# SkyCast Development Guide

## Setup Instructions

### 1. Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- NASA Earthdata Account

### 2. Clone Repository
```bash
git clone https://github.com/Abdullah2008-bit/NASA.git
cd NASA/skycast
```

### 3. Environment Setup

**Frontend**:
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API keys
npm install
npm run dev
```

**Backend**:
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**ML Training**:
```bash
cd ml
pip install -r requirements.txt
jupyter lab
```

### 4. Run with Docker
```bash
cd cloud
docker-compose up --build
```

## Project Structure

```
skycast/
├── frontend/          # Next.js app
├── backend/           # FastAPI server
├── ml/                # ML pipeline
├── cloud/             # Docker configs
├── .github/workflows/ # CI/CD
└── docs/              # Documentation
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

## API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Performance Optimization Checklist

- [ ] Use React.lazy() for code splitting
- [ ] Implement SWR caching strategies
- [ ] Optimize 3D rendering with LOD
- [ ] Use Web Workers for heavy computations
- [ ] Enable gzip/brotli compression
- [ ] Lazy load images with next/image
- [ ] Use proper cache headers
- [ ] Minimize bundle size
- [ ] Use CDN for static assets

## Deployment

**Frontend (Vercel)**:
```bash
vercel --prod
```

**Backend (AWS Lambda)**:
```bash
# Use AWS SAM or Serverless Framework
```

**Docker (Production)**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Testing

**Frontend**:
```bash
cd frontend
npm run test
```

**Backend**:
```bash
cd backend
pytest --cov
```

## Troubleshooting

### Common Issues

**1. CORS errors**: Check CORS_ORIGINS in backend/.env

**2. Redis connection failed**: Ensure Redis is running: `docker run -p 6379:6379 redis:7-alpine`

**3. NASA data access errors**: Verify Earthdata credentials

**4. Frontend build errors**: Clear cache: `rm -rf .next && npm run build`

## Resources

- [NASA Earthdata](https://earthdata.nasa.gov/)
- [TEMPO Data](https://tempo.si.edu/)
- [OpenAQ API](https://docs.openaq.org/)
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
