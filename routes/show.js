const router = require('express').Router();
const File = require('../models/file')

router.get('/:uuid',async (req,res)=>{
     try {
          
          const file = await File.findOne({uuid:req.params.uuid});
          if(!file) return res.render('download',{error:"link hasbeen expired"});

          return res.render('download',{
               fileName: file.filename,
               uuid:file.uuid,
               fileSize:file.size,
               downloadLink:`${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
          });
     } catch (error) {
          return res.render('download',{error:"something went wrong."});
     }

});


module.exports = router;