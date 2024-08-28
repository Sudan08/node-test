const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const joi = require('joi');
const fs = require('fs').promises;
const { v4 : uuidv4 } = require('uuid');
const filePath = './database/data.json';

const PASSWORD_REGEX = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})"
);

const checkDublicateEmailOrUsername = async (email, username) => {
    try {
    const data = await fs.readFile(filePath, 'utf8');
    const obj = JSON.parse(data);
        console.log(email   , username);
        const duplicate = obj.data.some(element => element.email === email || element.username === username);
        if (duplicate) {
            throw Error('Email or username already exists');
        }
    } catch (error) {
        throw error;
    }
};

const saveOnFile =  async (newData) => {
    try {
        const oldData = await fs.readFile(filePath, 'utf8');
        const obj = JSON.parse(oldData);
        await checkDublicateEmailOrUsername(newData.email, newData.username);

        obj.data.push(newData);
        const data = JSON.stringify(obj, null, 2); 
        await fs.writeFile(filePath, data);
        console.log('Data saved successfully');
    } catch (error) {
        throw error;
    }
    
}
const userCreationSchema = joi.object().keys({
    username: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().regex(PASSWORD_REGEX).required(),
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/user', async (req, res) => {
    try {
    const {error , value} = userCreationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Invalid request data',
            error: error.details
        });
    } else {
        const payload = {
            id: uuidv4(),
            ...value,
        }
        await saveOnFile(payload);
        return res.json({
            message: 'User created successfully',
            user: {
                id: payload.id,
                username: payload.username,
                email: payload.email,
            }
        });
    }}
     catch (error) {
        console.error('Error creating user', error);
        return res.status(400).json({
            message: error.message,
            error: error.details
        });
    }
    } 
);

module.exports = app;