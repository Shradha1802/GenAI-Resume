require("dotenv/config")
const connectDB = require("./src/config/database.js");

const app = require("./src/app.js");


connectDB();

app.listen(3000,()=>{
    console.log("Your server is running on port 3000");
})