/**
 * Created by Amit Thakkar on 9/26/15.
 */
((ng) => {
    'use strict';
    class MongooseSchemaGenerator {
        generate(columns) {
            let dynamicSchema = {_id: {type: 'ObjectId', unique: true, index: true}};
            columns.forEach(function (column) {
                let field = dynamicSchema[column.name] = {};
                column.type ? field.type = column.type : '';
                column.required ? field.required = column.required == 'true' : '';
                column.trim ? field.trim = column.trim == 'true' : '';
                column.unique ? field.unique = column.unique == 'true' : '';
                column.letterCase == 'L' ? field.lowercase = true : '';
                column.letterCase == 'U' ? field.uppercase = true : '';
                column.index ? field.index = column.index == 'true' : '';
                column.default ? field.default = column.default : '';
            });
            return dynamicSchema;
        }
    }
    let mongooseSchemaGenerator = new MongooseSchemaGenerator();
    let dynamicMongooseSchemaModule = ng.module('dynamicMongooseSchema', ['ngAnimate', 'ui.bootstrap']);
    dynamicMongooseSchemaModule.service('SchemaService', ['$http', function ($http) {
        let schemaService = this;
        const URL = 'schema';
        schemaService.save = (newSchema) => {
            return $http.post(URL, newSchema)
        };
        schemaService.list = () => {
            return $http.get(URL)
        };
    }]);
    dynamicMongooseSchemaModule.controller('AddSchemaController', [
        'SchemaService', '$modal', function (SchemaService, $modal) {
            let addSchemaController = this;
            addSchemaController.open = () => {
                let modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: 'SchemaController'
                });
            };
        }
    ]);
    dynamicMongooseSchemaModule.controller('SchemaController', [
        'SchemaService', '$rootScope',
        function (SchemaService, $rootScope) {
            let schemaController = this;
            schemaController.types = [
                'String',
                'Number',
                'Array',
                'Object'
            ];
            schemaController.addNewColumn = () => {
                console.log("test");
                schemaController.newSchema.columns.push({
                    name: 'field ' + schemaController.newSchema.columns.length
                });
            };
            schemaController.reset = () => {
                schemaController.newSchema = {
                    columns: []
                };
            };
            schemaController.save = () => {
                if (!schemaController.newSchema.databaseName) {
                    schemaController.errorMessage = 'Please provide Database Name';
                    return;
                }
                if (!schemaController.newSchema.tableName) {
                    schemaController.errorMessage = 'Please provide Table Name';
                    return;
                }
                if (schemaController.newSchema.columns.length < 1) {
                    schemaController.errorMessage = 'Please provide at-least one Column details';
                    return;
                }
                SchemaService.save(schemaController.newSchema)
                    .success(() => {
                        $rootScope.$emit('schema:added', schemaController.newSchema);
                        schemaController.reset();
                    })
                    .error((error) => {
                        schemaController.errorMessage = error;
                    });
            };
            if (!schemaController.newSchema) {
                schemaController.reset();
            }
        }
    ]);
    dynamicMongooseSchemaModule.controller('SchemaListController', [
        'SchemaService', '$rootScope',
        function (SchemaService, $rootScope) {
            let schemaListController = this;
            let setSchema = (index) => {
                schemaListController.schemaView = JSON.stringify(mongooseSchemaGenerator.generate(schemaListController.schemas[index].columns), undefined, 4);
            };
            SchemaService.list()
                .success((schemas) => {
                    schemaListController.schemas = schemas;
                    if (schemas.length > 0) {
                        setSchema(0);
                    }
                })
                .error((error) => {
                    schemaListController.errorMessage = error;
                });
            schemaListController.viewSchema = (index) => {
                setSchema(index);
            };
            $rootScope.$on('schema:added', (event, newSchema) => {
                schemaListController.schemas.push(newSchema);
                setSchema(schemaListController.schemas.length - 1);
            });
        }
    ]);
    dynamicMongooseSchemaModule.directive('jsonView', [() => {
        return {
            restrict: 'E',
            scope: {
                json: '@'
            },
            link: ($scope, element) => {
                let parseJsonToHTML = () => {
                    var jsonView = $scope.json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                            var cls = 'number';
                            if (/^"/.test(match)) {
                                if (/:$/.test(match)) {
                                    cls = 'key';
                                } else {
                                    cls = 'string';
                                }
                            } else if (/true|false/.test(match)) {
                                cls = 'boolean';
                            } else if (/null/.test(match)) {
                                cls = 'null';
                            }
                            return '<span class="' + cls + '">' + match + '</span>';
                        });
                    element.html('<pre>' + jsonView + '</pre>');
                };
                $scope.$watch('json', (newValue, oldValue) => {
                    if (newValue != oldValue) {
                        parseJsonToHTML();
                    }
                });
                parseJsonToHTML();
            }
        }
    }]);
})(angular);