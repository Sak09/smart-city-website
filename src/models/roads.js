const mongoose = require('mongoose');

const roadSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        lowecase:true,
    },
    length:{
        type:String,
        required:true,
    },
    width:{
        type:String,
        required:true,
    },
    lane:{
        type:String,
        required:true,
    },
    contractorName:{
        type:String,
        required:true,
    },
    contractorCompany:{
        type:String,
        required:true,
    },
    wardNumber:{
        type:String,
        required:true,
    },
    contractstartingDate:{
        type:String,
        required:true,
    },
    contractendingDate:{
        type:String,
        required:true,
    },
    Road_initial_point:{
        type:String,
        required:true,
    },
    Road_ending_point:{
        type:String,
        required:true,
    },
    Tenure:{
        type:String,
        required:true,
    },
    Last_contract_company:{
        type:String,
        required:true,
    }
})
module.exports=mongoose.model('Road',roadSchema);