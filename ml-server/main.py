from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict
import torch
import torch.nn as nn
import numpy as np
import pickle
import os


class IKNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(12, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(256, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(512, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),

            nn.Linear(256, 6)
        )

    def forward(self, x):
        return self.net(x)


BASE_DIR = os.path.dirname(__file__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = IKNet().to(device)
model.load_state_dict(torch.load(
    os.path.join(BASE_DIR, "best_model.pt"),
    map_location=device
))
model.eval()

with open(os.path.join(BASE_DIR, "scaler_X.pkl"), "rb") as f:
    scaler_X = pickle.load(f)

with open(os.path.join(BASE_DIR, "scaler_y.pkl"), "rb") as f:
    scaler_y = pickle.load(f)

print(f"Model loaded on {device}")


class PredictRequest(BaseModel):
    # Target end-effector pose
    x: float
    y: float
    z: float
    yaw: float
    pitch: float
    roll: float
    # Current joint state
    q1_in: float
    q2_in: float
    q3_in: float
    q4_in: float
    q5_in: float
    q6_in: float

class PredictResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    q1: float
    q2: float
    q3: float
    q4: float
    q5: float
    q6: float
    model_info: dict


app = FastAPI(
    title="IK Predictor ML Service",
    description="Inverse kinematics prediction for 6-DOF robotic arm",
    version="1.0.0"
)

@app.get("/health")
def health():
    return {"status": "ok", "device": str(device)}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        features = np.array([[
            req.x, req.y, req.z,
            req.yaw, req.pitch, req.roll,
            req.q1_in, req.q2_in, req.q3_in,
            req.q4_in, req.q5_in, req.q6_in
        ]])

        features_scaled = scaler_X.transform(features)
        tensor_in = torch.tensor(features_scaled, dtype=torch.float32).to(device)

        with torch.no_grad():
            output_scaled = model(tensor_in).cpu().numpy()

        output = scaler_y.inverse_transform(output_scaled)[0]

        return PredictResponse(
            q1=round(float(output[0]), 6),
            q2=round(float(output[1]), 6),
            q3=round(float(output[2]), 6),
            q4=round(float(output[3]), 6),
            q5=round(float(output[4]), 6),
            q6=round(float(output[5]), 6),
            model_info={
                "mean_r2": 0.9956,
                "overall_mae_deg": 5.491,
                "device": str(device)
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
