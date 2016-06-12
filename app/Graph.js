var Graph = function(){
    this.nodeSet = {};
    this.nodes = [];
    this.edges = [];
};

Graph.prototype.addNode = function(node){
    if(this.nodeSet[node.id] == undefined){
        this.nodeSet[node.id] = node;
        this.nodes.push(node);
        return true;
    }

    return false;
};

Graph.prototype.get = function(node){
    return this.nodeSet[node];
};

Graph.prototype.addEdge = function(from, to){
    if(from.addConnectedTo(to) == true){
        var edge = new Edge(from, to);
        this.edges.push(edge);
        return true;
    }

    return false;
};

var Node = function(id){
    this.id = id;
    this.nodesTo = [];
    this.position = {};
    this.data = {};
};

Node.prototype.addConnectedTo = function(node){
    if(this.connectedTo(node) == false){
        this.nodesTo.push(node);
        return true;
    }

    return false;
};

Node.prototype.connectedTo = function(node){
    for(var i = 0; i < this.nodesTo.length; i++){
        var connected = this.nodesTo[i];
        if(connected.id == node.id){
            return true;
        }
    }

    return false;
};

var Edge = function(from, to){
    this.from = from;
    this.to = to;
    this.data = {};
};

var DependencyGraph = function(options){
    this.graph = options.graph;
    this.nodesCount = options.nodesCount || 20;
    this.edgesCount = options.edgesCount || 10;
    this.xSize = options.size || document.body.clientWidth - 122;
    this.ySize = options.size || document.body.clientHeight;

    var self = this;

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(this.xSize, this.ySize);

    var camera = new THREE.PerspectiveCamera(40, this.xSize / this.ySize, 1, 10000000);
    camera.position.z = 5000;

    var trackBall = new THREE.TrackBall(camera);
    trackBall.rotateSpeed = 0.5;
    trackBall.dampingFactor = 0.3;
    trackBall.addEventListener("change", render);

    var scene = new THREE.Scene();
    var geometry = new THREE.CubeGeometry(100, 100, 100);
    var geometries = [];

    var drawNode = function(node){
        var drawObject = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5 }));

        var area = 5000;
        drawObject.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.position.y = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.position.z = Math.floor(Math.random() * (area + area + 1) - area);
        console.log("Node @" + JSON.stringify(drawObject.position));

        drawObject.id = node.id;
        node.data.drawObject = drawObject;
        node.position = drawObject.position;
        scene.add(drawObject);
    };

    var drawEdge = function(source, target){
        var material = new THREE.LineBasicMaterial({ color: 0xF3F3F3, opacity: 1, lineWidth: 0.5 });

        var geo = new THREE.Geometry();
        geo.vertices.push(source.data.drawObject.position);
        geo.vertices.push(target.data.drawObject.position);

        var line = new THREE.Line(geo, material, THREE.LinePieces);
        line.scale.x = line.scale.y = line.scale.z = 1;
        line.originalScale = 1;

        geometries.push(geo);

        scene.add(line);
    };

    var render = function(){
        for(var i = 0; i < geometries.length; i++){
            geometries[i].verticesNeedUpdate = true;
        }

        renderer.render(scene, camera);
    };

    var animate = function(){
        requestAnimationFrame(animate);
        trackBall.update();
        render();
    };

    var randomFromTo = function(from, to){
        return Math.floor(Math.random() * (to - from + 1) + from);
    };

    var compileGraph = function(graph){
        var node = new Node(0);
        graph.addNode(node);
        drawNode(node);

        var nodes = [];
        nodes.push(node);

        var steps = 1;
        while(nodes.length != 0 && steps < self.nodesCount){
            var n = nodes.shift();
            var numEdges = randomFromTo(1, self.edgesCount);
            for(var i = 1; i <= numEdges; i++){
                var target = new Node(i * steps);
                if(graph.addNode(target)){
                    drawNode(target);
                    nodes.push(target);
                    if(graph.addEdge(node, target)){
                        drawEdge(n, target);
                    }
                }
            }
            steps++;
        }
    };

    compileGraph(this.graph);
    animate();
    return renderer.domElement;
};