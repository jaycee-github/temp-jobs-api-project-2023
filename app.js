require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// extra packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connect DB
const connectDB = require("./db/connect.js");

const authenticateUser = require("./middleware/authentication.js");

// routers
const authRouter = require("./routes/auth.js");
const jobsRouter = require("./routes/jobs.js");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { getAllJobs } = require("./controllers/jobs.js");

app.set("trust proxy", 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each UP to 100 request per WindowMs
    })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
