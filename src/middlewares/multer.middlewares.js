import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null,`./public/images`)
    },filename : function(req,res,cb){
        cb(null, `&{Date.now()}-${this.filename.originalname}`)
    },

})

export const upload = multer({
    storage,
    limits:
    {fileSize: 1*1000*1000}
})