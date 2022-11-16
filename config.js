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
    dbPath: '/data/healthcheckr.db',

    /* 
     * Scheduling to check services status.
     * Default is every minute
     *  
     *      # ┌────────────── second (optional)     0-59
     *      # │ ┌──────────── minute                0-59
     *      # │ │ ┌────────── hour                  0-23
     *      # │ │ │ ┌──────── day of month          1-31
     *      # │ │ │ │ ┌────── month                 1-12 (or names in english)
     *      # │ │ │ │ │ ┌──── day of week           0-7  (or names in english, 0 or 7 are sunday)
     *      # │ │ │ │ │ │
     *      # │ │ │ │ │ │
     *      # * * * * * *
     * 
     */
    scheduling: '* * * * *'

};

module.exports = config