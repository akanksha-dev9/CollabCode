const mongoose=require("mongoose");

const roomSchema=new mongoose.Schema({
    roomId:{
        type: String,
        required: true,
        unique: true
    },
    code:{
        type: String,
        default: "//Start coding here..."
    },
    language:{
        type: String,
        default: "C++"
    },
    chat:[
        {
            sender: String,
            message: String,
            timestamp:{
                type: Date,
                default: Date.now
            }
        }
    ],
    snapshots:[ //version history of code changes
        {
            code: String,
            timestamp:{
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model("Room",roomSchema);