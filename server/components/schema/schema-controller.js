/**
 * Created by Amit Thakkar on 9/25/15.
 */
((require, module, global)=> {
    "use strict";
    const Schema = require('./schema-domain');
    let config = global.config;
    const HTTP_STATUS = global.HTTP_STATUS;
    //const mongoose = require('mongoose');
    const MongooseSchemaGenerator = require(process.cwd() + '/server/common/mongoose-schema-generator');
    let exports = module.exports;
    exports.save = (request, response) => {
        let newSchema = new Schema(request.body);
        newSchema.save((error) => {
            if (error) {
                logger.error(error);
                if (error.code == 11000) {
                    response.status(HTTP_STATUS.ERROR).json({message: "Document already present.", document: newSchema});
                } else {
                    response.status(HTTP_STATUS.ERROR).json(error.message);
                }
            } else {
                response.status(HTTP_STATUS.SUCCESS).json(newSchema);
            }
        });
    };
    exports.list = (request, response) => {
        let limit = request.params.limit || config.DEFAULT_LIMIT;
        let pageNumber = request.params.pageNumber || config.DEFAULT_PAGE_NUMBER;
        let options = {
            limit: limit,
            skip: (pageNumber - 1) * limit
        };
        logger.trace('Getting Schema List with options: ', options);
        Schema.findAll({__v: 0, isRemoved: 0, columns: 0}, options, (error, schemas) => {
            if (error) {
                logger.error(error);
                response.status(HTTP_STATUS.ERROR).json(error.message);
            } else {
                Schema.countAll((error, count) => {
                    if (error) {
                        logger.error(error);
                        response.status(HTTP_STATUS.ERROR).json(error.message);
                    } else {
                        response.status(HTTP_STATUS.SUCCESS).json({records: schemas, total: count});
                    }
                });
            }
        });
    };
    exports.get = (request, response) => {
        let _id = request.params._id;
        Schema.findOneById(_id, (error, schema) => {
            if (error) {
                logger.error(error);
                response.status(HTTP_STATUS.ERROR).json(error.message);
            } else {
                response.status(HTTP_STATUS.SUCCESS).json(schema);
            }
        });
    };
    exports.remove = (request, response) => {
        let _id = request.params._id;
        Schema.softRemove(_id, (error, result) => {
            if (error) {
                logger.error(error);
                response.status(HTTP_STATUS.ERROR).json(error.message);
            } else {
                if (result.n == 0) {
                    logger.debug('No Record Found with _id', _id);
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: false,
                        message: 'No Record Found with _id ' + _id
                    });
                } else if (result.nModified == 0) {
                    logger.debug('Record has already removed with _id ', _id);
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: false,
                        message: 'Record has already removed with _id ' + _id
                    });
                } else {
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: true,
                        message: 'Record Update with _id ' + _id
                    });
                }
            }
        });
    };
    exports.update = (request, response) => {
        let _id = request.params._id;
        var updatedSchemaFields = request.body;
        Schema.update(_id, updatedSchemaFields, (error, result) => {
            if (error) {
                logger.error(error);
                response.status(HTTP_STATUS.ERROR).json(error.message);
            } else  {
                if (result.n == 0) {
                    logger.debug('No Record Found with _id', _id);
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: false,
                        message: 'No Record Found with _id ' + _id
                    });
                } else if (result.nModified == 0) {
                    logger.debug('Record has already same date with _id ', _id);
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: false,
                        message: 'Record has already same date with _id ' + _id
                    });
                } else {
                    response.status(HTTP_STATUS.SUCCESS).json({
                        isSuccess: true,
                        message: 'Record Update with _id ' + _id
                    });
                    //delete mongoose.models[schemaName];
                    //delete mongoose.modelSchemas[schemaName];
                }
            }
        });
    };
    global.apiServer.getSchema = (databaseName, tableName, callback) => {
        Schema.findOneByDatabaseNameAndTableName(databaseName, tableName, function (error, table) {
            if (error) {
                logger.error(error);
            } else {
                callback(MongooseSchemaGenerator.generate(table));
            }
        });
    };
})(require, module, global);