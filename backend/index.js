import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import userRoutes from './routes/user.js';
import errorMiddleware from './middlewares/error.js'
import {createClient} from 'redis'


dotenv.config();
await connectDb();

const redisUrl=process.env.REDIS_URL;

if(!redisUrl){
  console.log("Missing redis url")
  process.exit(1);
}

export const redisClient= createClient({
  url:redisUrl
})

redisClient.connect().then(()=>console.log("connected to redis")).catch(console.error);

const app=express();
app.use(express.json());
// using routes
app.use("/api/v1",userRoutes);




// Always keep error middleware at the end
app.use(errorMiddleware);

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`server is runnig on port: ${PORT}`)
});