# healthcheckr
Simple services health checker

## Add a service 

### General case

    # Generated at http://jwtbuilder.jamiekurtz.com using the default JWT_PASSPHRASE set in config.js
    export HEALTHCHECKR_JWT_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqanJvbS9oZWFsdGhjaGVja3IiLCJpYXQiOjE2Njg1ODg2MjQsImV4cCI6MjAxNTc0MzgyNCwiYXVkIjoibG9jYWxob3N0Iiwic3ViIjoiMTAwIn0.B22VwW1hSkMh4nFgS9KHDCcpIFEqv2CfH6P39lJ-9EA

    curl -X POST http://localhost:4111/services -H "Content-Type: application/json" -H "Authorization: Bearer ${HEALTHCHECKR_JWT_TOKEN}" -d '
    {
        "title":"Mars Viking MDIM2.1",
        "description":"Single raster data layer based on Viking MDIM 2.1 dataset provided by [OpenPlanetary](https://www.openplanetary.org/opm-basemaps/global-viking-mdim2-1-colorized-mosaic)",
        "type":"XYZ",
        "url":"http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/viking_mdim21_global/{z}/{x}/{y}.png",
        "ping_url":"http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/viking_mdim21_global/3/1/1.png",
        "attributions":"OpenPlanetary"        
    }
    '

### Examples
You can use the following script to post example services to the database :

    ./postServices.sh -d data/services/
    
## Get the list of services

    curl -X GET http://localhost:4111/services

## Remove a service

    curl -X DELETE http://localhost:4111/services/0836b658-3f75-5427-a642-86bd71d4460c -H "Content-Type: application/json" -H "Authorization: Bearer ${HEALTHCHECKR_JWT_TOKEN}"