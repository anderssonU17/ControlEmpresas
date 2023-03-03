const {request, response} = require("express");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const Company = require('../models/company.model');

const validateJWT = async(req = request, res=response, next) => {
    const token = req.header("x-token");

    // Si no viene el token
    if(!token){
        return res.status(401).send({
            message: "No hay token en la peticion",
        });
    }

    try{
        //decodificar token 
        const payload = jwt.decode(token, process.env.SECRET_KEY);
        // Compania se buscara por medio del id 
        const companiaEncontrada = await Company.findById(payload.uId);
        console.log(companiaEncontrada);

        // verificar si no ha expirado 
        if(payload.exp <= moment().unix()){
            return res.status(500).send({message: "El token ha expirado"});
        }

        // Verificar si la compania sigue existiendo 
            if(!companiaEncontrada){
                return res.status(401).send({
                    message: "Token no valido - compania no existe"
                });
            }

            req.company = companiaEncontrada;

            next();
    }catch(err){
        throw new Error(err);
    }
}

module.exports = {validateJWT}