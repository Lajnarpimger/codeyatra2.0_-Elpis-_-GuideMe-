import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import { DBConnection } from "./lib/db.js";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.route.js";
import roomRouter from "./routes/room.route.js";
import cors from "cors";
import teacherRouter from "./routes/teacher.route.js";
import studentRoutes from "./routes/student.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if you are using cookies
  }),
);

const port = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/room", roomRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/student", studentRoutes);

app.listen(port, async () => {
  console.log(`Server is listening to port ${port}`);
  await DBConnection();
});
