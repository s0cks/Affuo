var Graph = function(){
    this.nodeSet = {};
    this.nodes = [];
    this.edges = [];
};

Graph.prototype.addNode = function(node){
    if(this.nodeSet[node] == undefined){
        var n = new Node(node);
        this.nodeSet[node] = n;
        this.nodes.push(n);
        return true;
    }

    return false;
};

Graph.prototype.get = function(node){
    return this.nodeSet[node];
};

Graph.prototype.addEdge = function(from, to){
    if(typeof from === "string"){
        from = this.nodeSet[from];
    }

    if(typeof to === "string"){
        to = this.nodeSet[to];
    }

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
};

var TreeGraph = function(options){
    this.graph = options.graph;
    this.nodesCount = options.nodesCount || 20;
    this.edgesCount = options.edgesCount || 10;
    this.xSize = options.size || document.body.clientWidth - 122;
    this.ySize = options.size || document.body.clientHeight;

    var self = this;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

    var drawNode = function(n){
        var drawObject = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5 }));
        var area = 5000;
        drawObject.position.x = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.position.y = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.position.z = Math.floor(Math.random() * (area + area + 1) - area);
        drawObject.id = n.id;

        n.data.drawObject = drawObject;
        n.position = drawObject.position;
        scene.add(n.data.drawObject);
    };

    var drawEdge = function(source, target){
        var material = new THREE.LineBasicMaterial({ color: 0xF3F3F3, opacity: 1, linewidth: 0.5 });

        var geo = new THREE.Geometry();
        geo.vertices.push(source.data.drawObject.position);
        geo.vertices.push(target.data.drawObject.position);

        var line = new THREE.LineSegments(geo, material);
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

    var compileGraph = function(graph){
        var i;
        for(i = 0; i < graph.nodes.length; i++){
            drawNode(graph.nodes[i]);
        }

        for(i = 0; i < graph.edges.length; i++){
            var edge = graph.edges[i];
            drawEdge(edge.from, edge.to);
        }
    };

    compileGraph(this.graph);
    animate();
    return renderer.domElement;
};