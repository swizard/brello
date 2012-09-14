
angular.module('project', ['mongolab']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', {controller:ListCtrl, templateUrl:'list.html'}).
            when('/edit/:projectId', {controller:EditCtrl, templateUrl:'detail.html'}).
            when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
            otherwise({redirectTo:'/'});
    })
    .service('notesService', function () {
        var data = [
            {id:1, title:'Note 1'},
            {id:2, title:'Note 2'},
            {id:3, title:'Note 3'},
            {id:4, title:'Note 4'},
            {id:5, title:'Note 5'},
            {id:6, title:'Note 6'},
            {id:7, title:'Note 7'},
            {id:8, title:'Note 8'}
        ];

        return {
            notes:function () {
                return data;
            },
            addNote:function (noteTitle) {
                var currentIndex = data.length + 1;
                data.push({
                    id:currentIndex, title:noteTitle
                });
            },
            deleteNote:function (id) {
                var oldNotes = data;
                data = [];

                angular.forEach(oldNotes, function (note) {
                    if (note.id !== id) data.push(note);
                });
            }
        };
    })
    .directive('myNotebook', function () {
        return {
            restrict:"E",
            scope:{
                notes:'=',
                ondelete:'&'
            },
            templateUrl:"partials/notebook-directive.html",
            controller:function ($scope, $attrs) {
                $scope.deleteNote = function (id) {
                    $scope.ondelete({id:id});
                }
            }
        };
    })
    .directive('myNote', function () {
        return {
            restrict:'E',
            scope:{
                delete:'&',
                note:'='
            },
            link:function (scope, element, attrs) {
                var $el = $(element);

                $el.hide().fadeIn('slow');

                $('.thumbnails').sortable({
                    placeholder:"ui-state-highlight", forcePlaceholderSize:true
                });
            }
        };
    })
    .controller('NotebookCtrl', ['$scope', 'notesService', function ($scope, notesService) {
    $scope.getNotes = function () {
        return notesService.notes();
    };

    $scope.addNote = function (noteTitle) {
        if(noteTitle != '') {
            notesService.addNote(noteTitle);
        }
    };

    $scope.deleteNote = function (id) {
        notesService.deleteNote(id);
    };

    $scope.resetForm = function() {
        $scope.noteTitle = '';
    };
}]);



function ListCtrl($scope, Project) {
    $scope.projects = Project.query();
}


function CreateCtrl($scope, $location, Project) {
    $scope.save = function() {
        Project.save($scope.project, function(project) {
            $location.path('/edit/' + project._id.$oid);
        });
    }
}


function EditCtrl($scope, $location, $routeParams, Project) {
    var self = this;

    Project.get({id: $routeParams.projectId}, function(project) {
        self.original = project;
        $scope.project = new Project(self.original);
    });

    $scope.isClean = function() {
        return angular.equals(self.original, $scope.project);
    }

    $scope.destroy = function() {
        self.original.destroy(function() {
            $location.path('/list');
        });
    };

    $scope.save = function() {
        $scope.project.update(function() {
            $location.path('/');
        });
    };
}

// This is a module for cloud persistance in mongolab - https://mongolab.com
angular.module('mongolab', ['ngResource']).
    factory('Project', function($resource) {
        var Project = $resource('https://api.mongolab.com/api/1/databases/brello/collections/cards/:id',
            { apiKey: '5052a289e4b0e5d855fe451c' }, {
                update: { method: 'PUT' }
            }
        );

        Project.prototype.update = function(cb) {
            return Project.update({id: this._id.$oid},
                angular.extend({}, this, {_id:undefined}), cb);
        };

        Project.prototype.destroy = function(cb) {
            return Project.remove({id: this._id.$oid}, cb);
        };

        return Project;
    })