/**
 * SnapPlanet Process Server
 *
 * Copyright 2022 Jérôme Gasperi
 *
 * All rights reserved
 *
 */

const fetch = require('node-fetch')
const { v5: uuidv5 } = require('uuid')
const nedb = require('nedb-revived')
const config = require('../config')

// Initialize datastore
var Datastore = new nedb({
	filename: config.dbPath,
	autoload: true
});

/**
 * I'm alive
 * 
 * @param {Object} req Request object
 */
function alive(req, res) {
	res.json({ message: 'alive' })
}

/**
 * Add a service
 *
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @returns {undefined}
 */
async function addService(req, res) {

	var mandatories = ['url', 'description', 'type'];

	// Check mandatory body content
	if (!req.body) {
		return res.status(400).send('Bad Request');
	}

	mandatories.forEach(element => {
		if ( !req.body[element] ) {
			return res.status(400).send('Bad Request - missing mandatory ' + element + ' property');
		}
	});

	// Add fields to input
	var now = (new Date()).toISOString()
	req.body._id = uuidv5(JSON.stringify(req.body.url).toLowerCase(), config.namespace)
	req.body.status = await getStatus(req.body.ping_url || req.body.url)
	req.body.created = now
	req.body.last_checked = now

	// Insert new service (unicity on _id)
	Datastore.insert(req.body, function (err, service) {

		if (err) {
			return res.status(500).send(err);
		}

		res.status(200).json(service);

	});

}

function dropService(req, res) {

	Datastore.remove({_id:req.params.id}, function(err, numRemoved) {

		if (err) {
			return res.status(500).send(err)
		}

		if ( numRemoved === 0 ) {
			return res.status(404).json({
				message: 'Not Found'
			})	
		}

		return res.status(200).json({
			message:"Removed service " + req.params.id
		})

	})
}

/**
 * Return service
 * 
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
function getService(req, res) {

	Datastore.find({_id:req.params.id}, function(err, service) {

		if (err) {
			return res.status(500).send(err)
		}

		if ( !service ) {
			return res.status(404)	
		}

		return res.status(200).json(service)

	})

}

/**
 * Return services
 * 
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
function getServices(req, res) {

	Datastore.find({}, function(err, services) {

		if (err) {
			return res.status(500).send(err)
		}

		return res.status(200).json({
			services:services
		})
	})
		
}

/**
 * Update status
 * 
 * @param {string} id 
 */
function checkStatus(id) {

	var constraint = id ? {_id:id} : {};

	Datastore.find(constraint, function(err, services) {

		if (err) {
			console.log(err);
		}

		// Convert services to array if not 
		if ( !services instanceof Array ) {
			services = [services]
		}

		for (var i = 0, ii = services.length; i < ii; i++) {
			updateStatus(services[i])
		}
	})

}

/**
 * Update service status
 * 
 * @param {object} service 
 */
async function updateStatus(service) {

	var status = await getStatus(service.ping_url || service.url)

	Datastore.update({ _id: service._id}, { $set: { status: status, last_checked: (new Date()).toISOString() } }, {}, function (err, numReplaced) {
		if (err) {
			console.log(err)
		}
	})

}

/**
 * Return the HTTP status of a url
 * 
 * @param {string} url 
 * @return {integer}
 */
async function getStatus(url) {

	var status = 0;

	try {
		const response = await fetch(url)
		status = await response.status
	} catch (err) {
		console.error(err)
	}
	
	return status

}


module.exports = {
	alive,
	addService,
	dropService,
	checkStatus,
	getService,
	getServices
}
