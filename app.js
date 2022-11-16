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
const cluster = require('cluster')
const bodyParser = require('body-parser')
const services = require('./app/services')
const security = require('./app/security')
const cron = require('node-cron');
const scheduling = require('./config').scheduling || '* * * * *'

// [IMPORTANT] HOST is set to 0.0.0.0 to be called outside of docker 
const PORT = 80;
const HOST = '0.0.0.0';

if (cluster.isPrimary) {
	var i, worker,
		numWorkers = require('os').cpus().length,
		fs = require('fs'),
		restartWorkers = function restartWorkers() {
			var wid, workerIds = []

			// create a copy of current running worker ids
			for (wid in cluster.workers) {
				workerIds.push(wid)
			}

			workerIds.forEach(function (wid) {
				cluster.workers[wid].send({
					text: 'shutdown',
					from: 'master'
				})

				setTimeout(function () {
					if (cluster.workers[wid]) {
						cluster.workers[wid].kill('SIGKILL')
					}
				}, 5000)
			})
		}

	console.log('Master cluster setting up ' + numWorkers + ' workers...')

	var shout = function () {
		console.log('arguments', arguments)
	}
	for (i = 0; i < numWorkers; i++) {
		worker = cluster.fork()
		worker.on('message', shout)
	}

	// set up listener of file changes for restarting workers
	fs.readdir('.', function (err, files) {
		files.forEach(function (file) {
			fs.watch(file, function () {
				restartWorkers()
			})
		})
	})

	cluster.on('exit', function (_worker, code, signal) {
		console.log('Worker ' + _worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
		console.log('Starting a new worker')
		worker = cluster.fork()
		worker.on('message', function () {
			console.log('arguments', arguments)
		})
	})

}
// Initialize cluster to use all server cpus
else {

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

}
