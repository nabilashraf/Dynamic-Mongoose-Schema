/**
 * Created by Amit Thakkar on 9/25/15.
 */
((require, module)=> {
    "use strict";
    const DEFAULT_LIMIT = 10;
    const DEFAULT_PAGE_NUMBER = 1;
    let Api = require('./api-domain');
    let exports = module.exports;
    exports.save = (request, response) => {
        let newApi = new Api(request.body);
        newApi.save((error) => {
            if (error) {
                logger.error(error);
                if (error.code == 11000) {
                    response.status(500).json("API already present.");
                } else {
                    response.status(500).json(error.message);
                }
            } else {
                response.status(200).json(newApi);
            }
        });
    };
    exports.list = (request, response) => {
        let limit = request.params.limit || DEFAULT_LIMIT;
        let pageNumber = request.params.pageNumber || DEFAULT_PAGE_NUMBER;
        let options = {
            limit: limit,
            skip: (pageNumber - 1) * limit
        };
        logger.trace('Getting Api List with options: ', options);
        Api.findAll(options, (error, Apis) => {
            if (error) {
                logger.error(error);
                response.status(500).json(error.message);
            } else {
                Api.countAll((error, count) => {
                    if (error) {
                        logger.error(error);
                        response.status(500).json(error.message);
                    } else {
                        response.status(200).json({tables: Apis, total: count});
                    }
                });
            }
        });
    };
    exports.get = (request, response) => {
        let _id = request.params._id;
        Api.findOneById(_id, (error, Api) => {
            if (error) {
                logger.error(error);
                response.status(500).json(error.message);
            } else {
                response.status(200).json(Api);
            }
        });
    };
    exports.remove = (request, response) => {
        let _id = request.params._id;
        Api.softRemove(_id, (error, result) => {
            if (error) {
                logger.error(error);
                response.status(500).json(error.message);
            } else {
                if (result.n == 0) {
                    logger.debug('No Record Found with _id', _id);
                    response.status(200).json({
                        isSuccess: false,
                        message: 'No Record Found with _id ' + _id
                    });
                } else if (result.nModified == 0) {
                    logger.debug('Record has already removed with _id ', _id);
                    response.status(200).json({
                        isSuccess: false,
                        message: 'Record has already removed with _id ' + _id
                    });
                } else {
                    response.status(200).json({
                        isSuccess: true,
                        message: 'Record Update with _id ' + _id
                    });
                }
            }
        });
    };
    exports.update = (request, response) => {
        let _id = request.params._id;
        var updatedApiFields = request.body;
        Api.update(_id, updatedApiFields, (error, result) => {
            if (error) {
                logger.error(error);
                response.status(500).json(error.message);
            } else {
                if (result.n == 0) {
                    logger.debug('No Record Found with _id', _id);
                    response.status(200).json({
                        isSuccess: false,
                        message: 'No Record Found with _id ' + _id
                    });
                } else if (result.nModified == 0) {
                    logger.debug('Record has already same date with _id ', _id);
                    response.status(200).json({
                        isSuccess: false,
                        message: 'Record has already same date with _id ' + _id
                    });
                } else {
                    response.status(200).json({
                        isSuccess: true,
                        message: 'Record Update with _id ' + _id
                    });
                }
            }
        });
    };
    exports.handler = (request, response) => {
        Api.findOneByURLAndMethod(request.url, request.method, (error, route) => {
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