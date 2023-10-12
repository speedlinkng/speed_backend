const {genSaltSync, hashSync, compareSync, compare} = require("bcrypt")
const {storeToken, ifexist, updateToken, defaultOauth2Data, myStorage, newStorage} = require('../services/google.services')
const {sign} = require("jsonwebtoken")
const express = require('express');
const fs = require('fs');
const {Readable} = require('stream');
const request = require("request");
const {google} = require('googleapis');
const {GoogleAuth} = require('google-auth-library');
const path = require('path');
const process = require('process');
const dotenv = require('dotenv');
const mime = require('mime');
const axios = require('axios');
const { checkToken } = require("../middlewares/ValidateToken");
dotenv.config();


module.exports = {
    uploadToDrive: async (req, res) => {
        const files = req.file;
    console.log(files)
        // GET ACCESS TOKEN
        var read = fs.readFileSync('cred.json');
        var json = JSON.parse(read);
        console.log('files')
        console.log(files)
        let filesize = files.size
        console.log(files.size)
        const bufferStream = new Readable.PassThrough();
        // bufferStream.end(files.buffer.subarray())
        bufferStream.end(files.buffer)
        console.log(bufferStream)
        return res.json({
        size:files.buffer.subarray()
        })
    }
}