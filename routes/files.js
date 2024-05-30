const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file')
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
require('dotenv').config();




//multer sorage
let storage = multer.diskStorage({
     destination: (req, file, cb)=>cb(null, 'uploads/'),
     filename: (req, file, cb)=>{
          const uniqueName = Date.now();
          cb(null, uniqueName + "-"+ file.originalname );
     },
})

//multer upload
let upload = multer({
     storage,
     limit: {fileSize: 1000000 * 100},
}).single('myfile');



router.post('/',(req,res)=>{
     
     //store file
     upload(req, res,async (err)=>{

          //validate request
          // console.log(req.file)
          if(!req.file){
               return res.json({erro:'all fields are required'});
          }


          if(err){
               return res.status(500).send({error: err.message})
          }

          //store in database
          const file = new File({
               filename: req.file.filename,
               uuid:uid.rnd(8),
               path:req.file.path,
               size: req.file.size,
          })
          const response = await file.save();
          return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
          // http://localhost:3000/files/23463hjsdgfgj-23dfgfsd
     })
     // Response -> link
})



router.post('/send',async(req,res)=>{
     const { uuid, emailTo, emailFrom }= req.body;
     if(!uuid || !emailTo || !emailFrom){
          return res.status(422).send({error:"all fields are required"});
     }

     //get data from database
     const file = await File.findOne({uuid:uuid});
     if(file.sender){
          return res.status(422).send({error:"email already sent"});
     }

     file.sender=emailFrom;
     file.receiver=emailTo;

     const response = await file.save();

     //send email
     const sendMail = require('../services/emailService');
     sendMail({
          from:emailFrom,
          to:emailTo,
          subject:"Inshare file sharing",
          text:`${emailFrom} shared a file with you.`,
          html: require('../services/emailTemplate')({
               emailFrom:emailFrom, 
               downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`, 
               size:parseInt(file.size/1000)+' kb', 
               expires:' 24hours',
          }),
     });
     return res.send({success:true});

});


module.exports = router;