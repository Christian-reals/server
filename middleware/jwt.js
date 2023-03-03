const  jwt = require('jsonwebtoken');
const { registrationDb } = require('../models/userdb');
require('dotenv')
const SECRET_KEY = process.env.SECRET_KEY;

async function   verifyToken (req,res,next) {
    const {token} = req.query;
    try {
        if (!token) {
            return res.status(401).json({
                msg: 'Invalid Token Format or no token found'
            })
        }
        console.log(SECRET_KEY)

        await jwt.verify(token, SECRET_KEY);
        const payload=await jwt.decode(token)
        payload?res.json({msg:'email verified',payload:payload}):null
        await registrationDb.findOneAndUpdate({_id:payload.id},{email_verified:true},{new:true})
        res.redirect(`http://127.0.0.1:5173/profile/?id=${payload.id}`)
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Session Expired',
                error: error.message,
            })
        }
        if (error instanceof jwt.JsonWebTokenError || error instanceof TokenError) {
            return res.status(401).json({
                message: 'Invalid Token',
                error: error.message,
            })
        }
        res.status(500).json({
            message: 'Internal server Error',
            error: error.message,
            stack: error.stack
        });
    }
}

const authMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({
            message: 'No Authorization Header'
        })
    }
    const token = authorization.split('Bearer ')[1];
    try {
        if (!token) {
            return res.status(401).json({
                message: 'Invalid Token Format'
            })
        }
        const decode = await jwt.verify(token, SECRET_KEY);
        req.user = decode
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Session Expired',
                error: error.message,
            })
        }
        if (error instanceof jwt.JsonWebTokenError || error instanceof TokenError) {
            return res.status(401).json({
                message: 'Invalid Token',
                error: error.message,
            })
        }
        res.status(500).json({
            message: 'Internal server Error',
            error: error.message,
            stack: error.stack
        });
    }

}

module.exports = {authMiddleware,verifyToken}