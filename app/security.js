/**
 * SnapPlanet Process Server
 *
 * Copyright 2022 Jérôme Gasperi
 *
 * All rights reserved
 *
 */

const jwt = require('jsonwebtoken')
const JWT_PASSPHRASE = require('../config').JWT_PASSPHRASE

/* 
 * List of valid JWT algorithms to avoid the "None algorithm" hack
 * https://blog.pentesteracademy.com/hacking-jwt-tokens-the-none-algorithm-67c14bb15771?gi=d403eb72f4fd
 */
const algorithms = ['HS256']

/**
 * Check that request is authenticated
 * 
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {function} next 
 * @returns 
 */
async function checkAuth(req, res, next) {

    var payload = getPayload(req)

    if ( !payload ) {
        return res.status(401).json({'message': 'Unauthorized'})  
    }
    
    next()
    
}

/**
 * Check that request is authenticated with admin rights
 * 
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {function} next 
 * @returns 
 */
async function checkAdminAuth(req, res, next) {

    var payload = getPayload(req)

    if ( !payload ) {
        return res.status(401).json({'message': 'Unauthorized'})  
    }
    // The admin user id (i.e. sub) is 100
    else if (payload.sub !== '100') {
        return res.status(403).json({'message': 'Forbidden'})  
    }

    next()

}

/**
 * Return jwt payload from input request
 * 
 * (see https://medium.com/@sbesnier1901/sécuriser-une-api-avec-node-js-et-jwt-15e14d9df109)
 * 
 * @param {Object} req Request object
 * @returns 
 */
function getPayload(req)  {

    let token = req.headers['x-access-token'] || req.headers['authorization']
    if (!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length)
    }
    
    if ( !token ) {
        return null
    }

    try {
        decoded = jwt.verify(token, JWT_PASSPHRASE, {
            algorithms:algorithms
        })
    } catch(err) {
        return null
    }

    return decoded

}

module.exports = {
    getPayload,
    checkAuth,
    checkAdminAuth
}