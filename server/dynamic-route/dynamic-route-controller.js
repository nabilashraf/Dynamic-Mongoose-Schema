/**
 * Created by Amit Thakkar on 10/13/15.
 */
((require, module)=> {
    "use strict";
    let DynamicRoute = require('./dynamic-route-domain');
    let exports = module.exports;
    exports.handler = (request, response) => {
        DynamicRoute.findOneByURLAndMethod(request.url, request.method, (error, route) => {
            if (error) {
                logger.error(error);
                response.status(500).json(error.message);
            } else if (!route) {
                response.status(200).json({
                    isSuccess: false,
                    errorCode: 404,
                    errorMessage: 'The requested URL ' + request.url + ' with Method ' + request.method + ' was not found on this server.'
                });
            } else {
                response.status(200).json(route);
            }
        });
    };
})(require, module);