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
	req.body._id = uuidv5(JSON.stringify(req.body.url).toLowerCase(), config.namespace)
	req.body.status = await getStatus(req.body.ping_url || req.body.url)
	req.body.created = Date.now();
	req.body.last_checked = Date.now();

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
			return res.status(404)	
		}

		return res.status(200).json({
			status:"success",
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

		return res.status(200).json(services)
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
	getService,
	getServices
}
