import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRouter from "./routes/authRoutes";
import adminRouter from "./routes/adminRoutes"
import propertyRouter from "./routes/propertyRouter"
import cookieParser from "cookie-parser";
import ownerRouter from "./routes/ownerRoutes"
import tenantRouter from "./routes/tenantRoutes"
import bookingRouter from "./routes/bookingRoutes"

// Connect to DB
connectDB();

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

app.post("/test", (req, res) => {
  console.log("✅ working test route", req.body);
  res.json({ ok: true });
});
// Routes
app.use("/api/auth", authRouter); 
app.use("/api/property", propertyRouter )
app.use('/api/owner',ownerRouter )
app.use('/api/tenant',tenantRouter)
app.use('/api/booking',bookingRouter)
// -----------------------------------------------------------------------

app.use('/admin',adminRouter)

// ==========================================================================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
