const Postdb = require('../models/postdb');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

//getting the directory outside controller
const dirnamearr= __dirname.split(`\\`)
const dirname = dirnamearr.splice(0,dirnamearr.length-1).join('/')

//setting up multer diskStorage method

const storage = multer.diskStorage({
	destination: `${dirname}/tmp/uploads`,
	filename: (req, file, cb) => {
        console.log(file.originalname)
		cb(null, file.fieldname+Date.now()+path.extname(file.originalname))
	},
    
});

const upload = multer({ storage: storage,  limits: {
    fieldNameSize: 300,
    fileSize: 50048579, // 5Mb
  }}).single('image');
//the 
const createPost = (async (req,res)=>{
    upload( req,res,async (err)=>{
        if (err) {
            res.status(401).send(err)
        }
        else{
            console.log(req.body,req.file.originalname)
            const post = new Postdb({
                ...req.body,
                image:{
                    data: fs.readFileSync(path.join(dirname + '/uploads/' + req.file.filename)),
                    contentType: 'image/*'
                },
                imageUrl:path.join(dirname + '/uploads/' + req.file.filename)
            })
            try {
                await post.save(post)
                console.log(post._id)
                res.status(201).json({msg:'image uploaded successfully'})
            } catch (error) {
                res.json({msg:'Upload is not successful',error:error})
            }
        }
    })
})

const getAllPost = async (req,res)=>{
    try {
        const {image,...others}= await Postdb.find({}).lean()
        console.log(others)
        res.status(200).json(others)

    } catch (error) {
        res.status(404).json({msg:'failed',error})
    }
}
const getPost = async (req,res)=>{
    const {id} = req.params
    try {
        const post= await Postdb.findById({_id:id})
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({msg:'failed',error})
    }
}


const updatePost = async (req,res)=>{
    const {id} = req.params
    try {
        const updatedPost = await Postdb.findByIdAndUpdate(id,req.body)
    } catch (error) {
        res.send(error)
    }
    
}

const deletePost = (req,res)=>{
    const {id} = req.params
    const deletedPost = Postdb.findByIdAndDelete(id)
}

module.exports={createPost,getAllPost,updatePost,deletePost,getPost}