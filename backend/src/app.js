const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/*require all routes here */
const AuthRouter = require("./router/auth.routes.js")
const InterviewRouter = require("./router/interview.router.js")

/*Use all routes here */
app.use("/api/auth", AuthRouter);
app.use("/api/interview", InterviewRouter);

module.exports = app;