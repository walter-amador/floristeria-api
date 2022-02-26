const bcrypt = require('bcrypt');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const secretRefreshKey = process.env.SECRETE_REFRESH_KEY;

const prisma = require('../config/db');
const userModel = prisma.user;

//Function to find all users (Future pagination functionality)
const findAll = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        users.forEach((user) => {
            delete user.password;
            delete user.refreshToken;
        });
        res.send(users);
    } catch (error) {
        next(error);
    }
}

//Function to find one user with response to client
const findOneUser = async (req, res, next) => {
    try {
        const user = await findById(req.params.id);
        delete user.refreshToken;
        delete user.password;

        res.status(200).json({
            status: 'ok',
            result: user
        });
    } catch (error) {
        next(error);
    }
}

//Function to find one user by id with prisma
const findById = async (id) => {
    const userId = parseInt(id);
    const user = await userModel.findUnique({
        where: {
            id: userId
        }
    });

    if(!user) {
        throw boom.notFound();
    }

    return user;
}

//Function to find one user by email with prisma
const findByEmail = async (email) => {
    const user = await userModel.findUnique({
        where: {
            email
        }
    });
    return user;
}

//Function to register user on database
const registerCustomer = async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        const { userName , userLastname, email } = req.body;
        
        const payload = {
            userId: user.id,
            role: user.userRole
        }

        const accessToken = jwt.sign(payload, secretAccessKey, {expiresIn: '20m'});
        const refreshToken = jwt.sign(payload, secretRefreshKey, {expiresIn: '10d'});
        const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

        const data = {
            userName,
            userLastname,
            email,
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
            userRole: 'customer',
            userStatus: 'ACT',
            refreshToken: hashRefreshToken
        }

        const user = await userModel.create({
            data
        });
        
        delete user.password;
        delete user.refreshToken;

        res.status(200).json({
            status: 'ok',
            result: user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
}

//Function to update one customer with response to client
const updateOneCustomer = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const changes = req.body;
        changes.birthDate = new Date(changes.birthDate);

        const user = await updateCustomer(id, changes);

        if(!user) {
            throw boom.notFound();
        }

        delete user.password;
        delete user.refreshToken;

        res.status(200).json({
            status: 'ok',
            result: user
        });
    } catch (error) {
        next(error);
    }
}

//Function to update customer information with prisma
const updateCustomer = async (id, changes) => {
    const user = await userModel.update({
        where: {
            id: id
        },
        data: {
            ...changes,
            updatedAt: new Date()
        }
    });

    return user;
}

const inactivateUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        //PART OF CRUD EVALUATION
        // const result = await userModel.delete({
        //     where: {
        //         id
        //     }
        // });

        const result = await userModel.update({
            where: {
                id
            },
            data: {
                userStatus: 'INA'
            }
        });

        res.status(200).json({
            status: 'ok',
            msg: `User ${result.userName} ${result.userLastname} inactivated successfully`,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

module.exports = { findAll, findOneUser, findById, findByEmail, registerCustomer, updateOneCustomer, updateCustomer, inactivateUser };
