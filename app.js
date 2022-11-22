/**
 * SnapPlanet Process Server
 *
 * Copyright 2022 Jérôme Gasperi
 *
 * All rights reserved
 *
 */
// Packages initialization
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const services = require('./app/services')
const security = require('./app/security')
const cron = require('node-cron');
const scheduling = require('./config').scheduling || '* * * * *'

// [IMPORTANT] HOST is set to 0.0.0.0 to be called outside of docker 
const PORT = 80;
const HOST = '0.0.0.0';

var app = express()

// Allow cors on this API
app.use(cors())

// Fix AWS wrong headers
app.use(function (req, res, next) {
	if (req.headers['x-amz-sns-message-type']) {
		req.headers['content-type'] = 'application/json;charset=UTF-8'
	}
	next()
})

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
 * Routes
 */
app.get('/', services.alive);
app.get('/services', services.getServices)
app.get('/services/:id', services.getService)
app.delete('/services/:id', security.checkAuth, services.dropService)
app.post('/services', security.checkAuth, services.addService)

// Start the server on localhost only
app.listen(PORT, HOST, function () {
	console.log('healthcheckr ' + process.pid + ' running on http://' + HOST + ':' + PORT + ' to all incoming requests')
})

// Initialize cron job to check registered service status
cron.schedule(scheduling, () =>  {
	console.log('Check services status now')
	services.checkStatus()
})
	
// This is for clustering
process.on('message', function (message) {
	if (message.type === 'shutdown') {
		process.exit(0)
	}
})
