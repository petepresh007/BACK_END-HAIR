const express = require("express");
const app = express();
const port = process.env.PORT || 5002;


app.get("/", (req, res)=>{
    res.send("Welcome...")
})












app.listen(port, ()=> console.log(`app listening on port: ${port}`))