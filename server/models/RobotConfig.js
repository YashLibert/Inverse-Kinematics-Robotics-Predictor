import mongoose from "mongoose";

const robotConfigSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: String,
            unique: true
        },
        description: {
            type: String,
            default: " "
        },

        joints: {
            q1: { type: Number, required: true },
            q2: { type: Number, required: true },
            q3: { type: Number, required: true },
            q4: { type: Number, required: true },
            q5: { type: Number, required: true },
            q6: { type: Number, required: true }
        },

        pose: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            z: { type: Number, required: true },
            yaw: { type: Number, required: true },
            pitch: { type: Number, required: true },
            roll: { type: Number, required: true }
        }
    },
    { timestamps: true }
)

export default mongoose.model('RobotConfig', robotConfigSchema)