var app = angular.module("affuo", [ "ngRoute" ]);

var treeData = {
    "name": "Parent",
    "parent": null,
    "children": [
        {
            "name": "Test",
            "parent": "Parent",
            "children": []
        },
        {
            "name": "Hello World",
            "parent": "Parent",
            "children": []
        }
    ]
};

app.service("GitHubService", ["$http", function($http){
    return ({
        _base_url: "https://api.github.com",
        getRepository: function(user, repo){
            return $http.get(this._base_url + "/repos/" + user + "/" + repo);
        }
    });
}]);

app.controller("mainCtrl", ["$scope", "GitHubService", function($scope, $github){
    $scope.tree = treeData;
    $scope.loadRepository = function(url){
        if(url.startsWith("https://github.com/")) url = url.replace("https://github.com/", "");
        if(url.startsWith("http://github.com/")) url = url.replace("http://github.com/", "");
        var user = url.substring(0, url.lastIndexOf("/"));
        var repository = url.substring(url.lastIndexOf("/") + 1);
        $github.getRepository(user, repository)
            .success(function(data){
                $scope.repository = data;
            });
    };
}]);