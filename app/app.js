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

app.service("javaToAST", [function(){

}]);

app.directive("cfg", [function($scope){
    return {
        restrict: "E",
        replace: true,
        scope: false,
        link: function($scope, $elem, $attrs){
            var width = (parseInt($attrs.width) || document.body.clientWidth),
                height = (parseInt($attrs.height) || document.body.clientHeight);

            var tree = d3.layout.tree()
                .size([height, width]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d){
                    return [d.y, d.x];
                });

            var svg = d3.select($elem[0])
                .append("svg")
                .attr("width", width)
                .attr("class", "cfg")
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(120,0)");

            var root = $scope.tree;
            root.x0 = height / 2;
            root.y0 = 0;

            var i = 0;

            (function update(source){
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

                nodes.forEach(function(d){
                    d.y = d.depth * 180;
                });

                var node = svg.selectAll("g.node")
                    .data(nodes, function(d){
                        return d.id || (d.id = ++i);
                    });

                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d){
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    });

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", "#FFF");
                nodeEnter.append("text")
                    .attr("x", function(d){
                        return d.children ? -13 : 13;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d){
                        return d.children ? "end" : "start";
                    })
                    .text(function(d){
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6);

                var nodeUpdate = node.transition()
                    .duration(750)
                    .attr("transform", function(d){
                        return "translate(" + d.y + "," + d.x + ")";
                    });
                nodeUpdate.select("circle")
                    .attr("r", 10)
                    .style("fill", "#FFF");
                nodeUpdate.select("text")
                    .style("fill-opacity", 1)
                    .style("fill", "#FFF");

                var nodeExit = node.exit().transition()
                    .duration(750)
                    .attr("transform", function(d){
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();
                nodeExit.select("circle")
                    .attr("r", 1e-6);
                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                var link = svg.selectAll("path.link")
                    .data(links, function(d){
                        return d.target.id;
                    });
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d){
                        var point = {
                            x: source.x0,
                            y: source.y0
                        };
                        return diagonal({ source: point, target: point });
                    });
                link.transition()
                    .duration(750)
                    .attr("d", diagonal);
                link.exit().transition()
                    .duration(750)
                    .attr("d", function(d){
                        var point = {
                            x: source.x,
                            y: source.y
                        };
                        return diagonal({ source: point, target: point });
                    })
                    .remove();

                nodes.forEach(function(n){
                    n.x0 = n.x;
                    n.y0 = n.y;
                });
            })(root);

            d3.select(self.frameElement).style("height", "500px");
        }
    };
}]);

app.controller("mainCtrl", ["$scope", "$injector", function($scope, $injector){
    $scope.parser = $injector.get("javaToAST");
    $scope.tree = treeData;
}]);