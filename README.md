🎬 Film Finance Simulator

A fullstack tool to model, analyze, and visualize financial returns for film projects based on flexible assumptions.

📦 Project Structure
```
.
├── finengine/        # FastAPI backend (runs the financial model)
├── greenlight/       # React + Vite frontend (visualizes outputs)
```

🚀 Getting Started

1. Backend: finengine (FastAPI + Python)

✅ Setup (Python 3.10+ recommended)
```aiignore
cd finengine
./create_venv.sh
source ./venv-activate.sh
./start-server.sh
```

Visit: http://localhost:8000/docs for the auto-generated API docs.

2. Frontend: greenlight (React + Vite)

✅ Setup
```aiignore
cd greenlight
npm install
```

🧪 Run Locally
```aiignore
npm run dev
```

Visit: http://localhost:5173

⚙️ Customizing Inputs

Use the frontend UI to adjust:
•	Equity / debt / gap financing
•	Revenue assumptions
•	Investor waterfall terms
•	Projection timelines

The backend calculates:
•	ROI & IRR for 3 scenarios
•	Breakeven point
•	Year-by-year cash flow


