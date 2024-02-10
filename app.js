require("express-async-errors");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT || 5002;
const cors = require("cors");
const notFoundPage = require("./middleware/notFoundPage");
const errorHandler = require("./middleware/errorHandler");
const { join } = require("path");
const connectDB = require("./db/connectDB");
mongoose.set('strictQuery', false);
const origin = "https://front-hair-rouge.vercel.app" || "http://localhost:5173";
const adminRouter = require("./routes/SuperAdmin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");


app.use(express.json());

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));
//app.use(cors());

app.use("/upload", express.static(join(__dirname, "/upload")));


app.get("/", (req, res) => {
    res.send("Welcome...");
})

//Routes
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter)



app.use(notFoundPage);
app.use(errorHandler);

async function startApplication() {
    try {
        const db = await connectDB();
        if (db) {
            console.log("connected to database successfully...")
        }
        app.listen(port, () => console.log(`app listening on port: ${port}`))
    } catch (error) {
        console.log(error);
    }
}

startApplication();