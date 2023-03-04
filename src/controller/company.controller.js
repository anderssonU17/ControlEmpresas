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


const editBranchOffice = async(req, res) => {
    const id = req.params.id;
    const {idSucursal, name, address, municipality} = req.body;
    const companyId = req.company.id;
    try{
        const updateSucursal = await Company.updateOne(
            {_id: id, "branchOffices._id": idSucursal},
            {
                $set: {
                    "branchOffices.$.name": name,
                    "branchOffices.$.address": address,
                    "branchOffices.$.municipality": municipality,
                },
            },
            {new: true}
        );
        if(!updateSucursal){
            return res.status(404).send({message: 'No existe esta sucursal'});
        }

        return res
        .status(200)
        .send({updateSucursal, message: 'Sucursal editada correctamente'});
    }catch(err){
        throw new Error(err);
    }
    
}

const deleteBranchOffice = async (req, res = response) => {
    try {
    const { name } = req.body;
    const { company } = req;

      // Eliminar el branch office
    company.branchOffices = company.branchOffices.filter(
        (office) => office.name !== name
    );
    await company.save();

    res.status(200).json({
        ok: true,
        message: "Branch office eliminado correctamente",
        company,
    });
    } catch (error) {
    console.log(error);
    res.status(500).json({
        ok: false,
        message: "Error al eliminar el branch office",
    });
    }
};

const readBranchOffices = async (req, res) => {
    try {
        const company = req.company;
        const branchOffices = company.branchOffices;

        res.status(200).json(branchOffices);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al listar los branchOffices" });
    }
};

module.exports = {createCompany, readCompany, loginCompany, addBranchOffice, editBranchOffice, deleteBranchOffice, readBranchOffices};
