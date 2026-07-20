const express=require('express');
const http=require('http');
const { Server }=require('socket.io');
const mongoose=require('mongoose');
const cors=require('cors');
const roomRoutes = require('./routes/room');
const executeRoutes = require('./routes/execute');
const aiRoutes = require("./routes/ai"); // path may differ

require('dotenv').config();

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin: 'http://localhost:5173',
        methods: ['GET','POST']
    }
});

io.on('connection', (socket) => {
  console.log('SOCKET CONNECTED:', socket.id);
});

app.use(cors());
app.use(express.json());

app.use('/api/room', roomRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/execute", executeRoutes);

mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log('MongoDB connected'))
    .catch((err)=>console.log(err));

app.get('/',(req,res)=>{
    res.send('Server is running');
});

const socketHandler=require('./socket/socketHandler');
socketHandler(io);

const PORT=process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
});