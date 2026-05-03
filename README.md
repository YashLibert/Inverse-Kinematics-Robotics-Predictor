<div align="center">

# IK Predictor

**Neural Inverse Kinematics for the ABB IRB 120 - 6-DOF Industrial Robotic Arm**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-black?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)

> End-to-end neural IK system - from a trained PyTorch model to a live browser-based 3D visualizer.

</div>

---

## What this is

Classical inverse kinematics solves a deceptively hard problem: given a target pose in 3D space, what joint angles should each of the 6 motors move to? Analytical IK involves pages of trigonometry, breaks at singularities, and has to be re-derived for every new robot geometry.

This project replaces that with a neural network trained for the ABB IRB 120. A FastAPI ML service predicts the six joint angles, an Express API forwards requests and stores history/configs in MongoDB, and a React + Three.js frontend visualizes the robot arm live.

---

## The ambiguity problem

A 6-DOF arm reaching a target can often do so with multiple valid joint configurations: elbow up, elbow down, wrist rotated, shoulder flipped, and more. If the model only receives a position, a standard MSE regressor can average those valid solutions together and produce an invalid pose.

The fix used here is to condition the model on the current joint state. The input has 12 values:

```text
[x, y, z, yaw, pitch, roll, q1_in, q2_in, q3_in, q4_in, q5_in, q6_in]
 \__________________________/  \_____________________________________/
        target pose                    current joint state
```

That makes the prediction local to the robot's current solution family instead of asking the model to collapse all possible IK branches into one answer.

---

## Results

| Metric | Value |
|--------|-------|
| Mean R2 | **0.9956** |
| Overall MAE | **5.491 deg** |
| Architecture | MLP - 12 -> 256 -> 512 -> 1024 -> 512 -> 256 -> 6 |
| Runtime device | CPU or CUDA, selected automatically by PyTorch |

---

## Architecture

```text
Browser: React + Three.js
  - IKInputPanel.jsx sends target pose and current joints
  - ArmViewer.jsx renders the 6-DOF arm
  - ConfigPanel.jsx saves/loads robot configurations
  - PredictionLog.jsx shows recent prediction history

        POST /api/predict
        GET  /api/predict/history
        CRUD /api/configs
                |
                v
Node.js / Express API
  - routes/predict.js forwards predictions to the ML service
  - routes/configs.js manages saved robot configs
  - models/Prediction.js logs predictions
  - models/RobotConfig.js stores named configs
                |
                v
FastAPI ML service
  - ml-server/main.py loads best_model.pt
  - scaler_X.pkl normalizes inputs
  - scaler_y.pkl restores predicted joint angles
                |
                v
MongoDB Atlas
  - robot configurations
  - prediction history
```

---

## Stack

| Layer | Technology | Why |
|-------|------------|-----|
| ML model | PyTorch MLP | Full control over architecture and inference |
| ML serving | FastAPI + Uvicorn | Simple typed API with `/docs` |
| API | Node.js + Express ESM | Clean async routes and service separation |
| Database | MongoDB Atlas + Mongoose | Document-shaped robot configs and prediction logs |
| Frontend | React 19 + Vite | Fast dev loop, JSX, hooks |
| 3D | Three.js | Custom robot geometry and live joint animation |
| Scaling | scikit-learn StandardScaler | Serialized input/output scalers loaded at inference |

---

## Project structure

```text
Inverse-Kinamatics-Robotics/
|
|-- README.md
|-- .gitignore
|
|-- Scripts/                         # Reserved for offline scripts/utilities
|
|-- ml-server/                       # Python FastAPI ML service
|   |-- main.py                      # /health and /predict endpoints
|   |-- requirements.txt             # Python dependencies
|   |-- best_model.pt                # Trained PyTorch weights
|   |-- scaler_X.pkl                 # Input StandardScaler
|   |-- scaler_y.pkl                 # Output StandardScaler
|   `-- __pycache__/                 # Generated Python cache
|
|-- server/                          # Node.js / Express backend
|   |-- package.json                 # "type": "module"
|   |-- package-lock.json
|   |-- index.js                     # Express app entry point
|   |-- config/
|   |   `-- db.js                    # Mongoose connection
|   |-- middleware/
|   |   `-- errorHandler.js          # Central error response handler
|   |-- models/
|   |   |-- Prediction.js            # Prediction history schema
|   |   `-- RobotConfig.js           # Saved configuration schema
|   `-- routes/
|       |-- predict.js               # POST /api/predict, GET /api/predict/history
|       `-- configs.js               # GET/POST/DELETE /api/configs
|
`-- client/                          # React + Vite frontend
    |-- package.json                 # "type": "module"
    |-- package-lock.json
    |-- vite.config.js               # Vite dev proxy to localhost:5000
    |-- eslint.config.js
    |-- index.html
    |-- README.md
    `-- src/
        |-- main.jsx
        |-- App.jsx
        |-- api/
        |   `-- client.js            # Fetch wrapper for /api
        |-- components/
        |   |-- ArmViewer.jsx        # Three.js canvas wrapper
        |   |-- ConfigPanel.jsx      # Save/delete robot configurations
        |   |-- IKInputPanel.jsx     # Pose and joint inputs
        |   `-- PredictionLog.jsx    # Recent predictions table
        |-- hooks/
        |   |-- useConfigs.js        # Config API state
        |   |-- useHistory.js        # Prediction history API state
        |   `-- usePredict.js        # Prediction API state
        `-- three/
            `-- ArmScene.js          # Three.js robot scene and joint updates
```

---

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas connection string

### 1. Start the ML service

The repository expects the trained artifacts to be present in `ml-server/`:

- `best_model.pt`
- `scaler_X.pkl`
- `scaler_y.pkl`

```bash
cd ml-server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```bash
curl http://localhost:8000/health
# {"status":"ok","device":"cpu"}
```

Single prediction:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"x":0.25,"y":0.10,"z":0.35,"yaw":0,"pitch":0,"roll":0,"q1_in":0,"q2_in":0,"q3_in":0,"q4_in":0,"q5_in":0,"q6_in":0}'
```

FastAPI docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_uri
ML_SERVICE_URL=http://localhost:8000
PORT=5000
```

Then run:

```bash
npm run dev
```

Backend health check:

```bash
curl http://localhost:5000/health
# {"status":"ok","service":"ik-predictor-server"}
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually [http://localhost:5173](http://localhost:5173). The Vite config proxies `/api` requests to `http://localhost:5000`.

---

## API reference

### ML service - FastAPI, port 8000

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `GET` | `/health` | - | `{status, device}` |
| `POST` | `/predict` | `{x, y, z, yaw, pitch, roll, q1_in, q2_in, q3_in, q4_in, q5_in, q6_in}` | `{q1..q6, model_info}` |

### Node.js backend - Express, port 5000

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Backend health check |
| `POST` | `/api/predict` | Forward to ML service and log result to MongoDB |
| `GET` | `/api/predict/history?limit=20` | List recent predictions |
| `GET` | `/api/configs` | List saved robot configurations |
| `POST` | `/api/configs` | Save a new configuration |
| `DELETE` | `/api/configs/:id` | Delete a configuration |

---

## Model details

### Architecture

```text
Input (12) -> Linear(256)  -> BatchNorm -> ReLU -> Dropout(0.1)
           -> Linear(512)  -> BatchNorm -> ReLU -> Dropout(0.1)
           -> Linear(1024) -> BatchNorm -> ReLU -> Dropout(0.1)
           -> Linear(512)  -> BatchNorm -> ReLU -> Dropout(0.1)
           -> Linear(256)  -> BatchNorm -> ReLU
           -> Linear(6)
```

### Input features

```text
[x, y, z, yaw, pitch, roll, q1_in, q2_in, q3_in, q4_in, q5_in, q6_in]
```

All inputs are normalized with `scaler_X.pkl` before inference. The model output is converted back to joint-angle units with `scaler_y.pkl`.

---

## Three.js visualizer

The robot arm is generated from Three.js primitives in `client/src/three/ArmScene.js`:

- Layered cylinder base
- Spherical joint housings
- Tapered cylinder links
- Torus rings for joint detail
- End-effector TCP marker
- Floor and shadow receiver

`updateArmAngles()` applies the six predicted angles to the joint chain and keeps the visualizer synchronized with API responses.

---

## What's next

- [ ] Add orientation-aware validation for roll, pitch, and yaw targets
- [ ] Add collision detection for obstacles
- [ ] Export the model to ONNX for browser-side inference
- [ ] Add Docker Compose for one-command startup
- [ ] Add WebSocket streaming for continuous arm control

---

<div align="center">

Built with PyTorch, FastAPI, Node.js, React, Three.js, and MongoDB.

ABB and IRB 120 are trademarks of ABB Ltd. This project is not affiliated with or endorsed by ABB.

</div>
