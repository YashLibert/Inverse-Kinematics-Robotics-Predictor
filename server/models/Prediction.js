import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema(
  {
    input: {
      x:     Number,
      y:     Number,
      z:     Number,
      yaw:   Number,
      pitch: Number,
      roll:  Number,
      q1_in: Number,
      q2_in: Number,
      q3_in: Number,
      q4_in: Number,
      q5_in: Number,
      q6_in: Number
    },
    output: {
      q1: Number,
      q2: Number,
      q3: Number,
      q4: Number,
      q5: Number,
      q6: Number
    },
    model_info: {
      mean_r2:         Number,
      overall_mae_deg: Number,
      device:          String
    }
  },
  { timestamps: true }
)

export default mongoose.model('Prediction', predictionSchema)