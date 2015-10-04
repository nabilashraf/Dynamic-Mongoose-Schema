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
    let dynamicMongooseSchemaModule = ng.module('dynamicMongooseSchema', ['ui.bootstrap']);
    dynamicMongooseSchemaModule.service('SchemaService', ['$http', function ($http) {
        let schemaService = this;
        const URL = 'schema/';
        schemaService.save = (newSchema) => {
            return $http.post(URL, newSchema)
        };
        schemaService.list = () => {
            return $http.get(URL)
        };
        schemaService.get = (id) => {
            return $http.get(URL + id)
        };
        schemaService.remove = (id) => {
            return $http.delete(URL + id)
        };
    }]);

    dynamicMongooseSchemaModule.controller('SchemaViewController', [
        'SchemaService', 'schema_id','$rootScope',
        function (SchemaService, schema_id,$rootScope) {
            let schemaViewController = this;
            SchemaService.get(schema_id)
                .success((data) => {
                    schemaViewController.schemaView = JSON.stringify(mongooseSchemaGenerator.generate(data.columns), undefined, 4);
                })
                .error((error) => {

                });
            schemaViewController.ok = () => {
                $rootScope.$modalInstance.close();
            };
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