const express = require('express');
const dotenv = require('dotenv');

const connectDB = require('./Config/dbConnect');
const userRouter = require('./Routes/user');
const postRouter = require('./Routes/posts');
const commentRouter = require('./Routes/comments');
const categoryRouter = require('./Routes/categories');
const globalErrHandler = require('./Helpers/Midddlewares/globalErrHandler');

const app = express();
dotenv.config();

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//routes
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/categories", categoryRouter);

//Error handler Middleware
app.use(globalErrHandler);

//404 error
app.use('*', (req, res) => {
    console.log(req.originalUrl);
    res.status(404).json({
        message: `${req.originalUrl} - Route Not Found`,
    });
});


//Listen to server
const PORT = process.env.PORT || 3090;
const start = async () => {
    try{
        const connected = await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () =>{
            console.log(`Server is up and running on port ${PORT} \n Mongodb connected ${connected.connection.host}`);
        }); 
    }catch(err){
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
}
start();
