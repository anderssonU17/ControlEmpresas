'use strict'

const Company = require('../models/company.model');
const bcrypt = require('bcrypt');
const {generateJWT} = require('../../src/helpers/create-jwt')

const createCompany = async(req, res) => {
    const {name, email, password, address, typeCompany} = req.body;

    try{
        let company = await Company.findOne({email: email});
        if(company){
            return res.status(400).send({
                message: 'Una empresa ya cuenta con este email', 
                ok: false, 
                company: company,
            });
        }

        company = new Company(req.body);

        //Encriptar la contrasenia 
        const saltos = bcrypt.genSaltSync();
        company.password = bcrypt.hashSync(password, saltos);

        // Guardar compania 
        company = await company.save();

        // generar token 


        res.status(200).send({
            message: `Compania ${name} creada correctamente`, 
            ok: true, 
            company: company,
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            ok: false, 
            message: `No se ha creado la empresa ${name}`, 
            error: err,
        })
    }
}

const readCompany = async(req, res) => {
    try{
        const company = await Company.find();

        if(!company){
            res.status(404).send({message: 'No hay companias registradas'})
        }else {
            res.status(200).json({'Companias encontradas ': company})
        }
    }catch(err){
        throw new Error(err)
    }
}

const loginCompany = async(req, res) => {
    const {email, password} = req.body; 
    try{
        const company = await Company.findOne({email});
        if(!company){
            return res
            .status(400)
            .send({ok: false, message: "La compania no existe"});
        }
        const validPassword = bcrypt.compareSync(
            password, 
            company.password
        )
        if(!validPassword){
            return res 
            .status(400)
            .send({ok: false, message: "password incorrecto"})
        }

        // Token 
        const token = await generateJWT(company.id, company.email, company.email);
        res.json({
            ok: true, 
            uid: company.id, 
            name: company.name, 
            email: company.email, 
            token, 
            message: `Te has logeado correctamente, bienvenido ${company.name}`
        })
    }catch(err){
        throw new Error(err);
    }
}

const addBranchOffice = async(req, res) => {
    const {name, address, municipality} = req.body;
    const companyId = req.company.id; // Obtenemos el id de la empresa del token 

    try{
        const company = await Company.findById(companyId);
        if(!company){
            return res.status(400).json({message: 'La empresa no existe'});
        }

        const newBranchOffice = {
            name, 
            address, 
            municipality,
        };

        company.branchOffices.push(newBranchOffice); // Se agrega la sucursal 
        await company.save();

        res.json({message: 'Sucursal agregada exitosamente'});
    }catch(error){
        console.log(error);
        res.status(500).send("Error en el servidor")
    }
}
module.exports = {createCompany, readCompany, loginCompany, addBranchOffice};
