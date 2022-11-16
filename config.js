/**
 * Healthcheckr
 *
 * Copyright 2022 Jérôme Gasperi
 *
 * All rights reserved
 *
 */

const config = {

    // Passphrase for auth token generation/check
    JWT_PASSPHRASE: process.env.JWT_PASSPHRASE || 'healthcheckrsupersecretphrase',

    // [DO NOT CHANGE] Used to generate UUIDv5 identifiers for processes
    namespace: '067eb7f3-208f-486b-924c-b38d66624115',

    // [DO NOT CHANGE] Database path
    dbPath: '/data/healthcheckr.db'

};

module.exports = config