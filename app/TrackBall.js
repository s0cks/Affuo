THREE.TrackBall = function (obj, dom) {
    this.object = obj;
    this.dom = (dom !== undefined) ? dom : document;

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;
    this.dampingFactor = 0.2;
    this.screen = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    this.target = new THREE.Vector3();
    this.lastPosition = new THREE.Vector3();
    this.position = new THREE.Vector3();

    this.rotateStart = new THREE.Vector3();
    this.rotateEnd = new THREE.Vector3();

    this.zoomStart = new THREE.Vector2();
    this.zoomEnd = new THREE.Vector2();

    this.panStart = new THREE.Vector2();
    this.panEnd = new THREE.Vector2();

    var State = {
        NONE: 1 << 0,
        ROTATE: 1 << 1,
        ZOOM: 1 << 2,
        PAN: 1 << 3
    };

    var self = this;
    this.rotate = (function () {
        var axis = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        return (function(){
            var angle = Math.acos(self.rotateStart.dot(self.rotateEnd) / self.rotateStart.length() / self.rotateEnd.length());
            console.log(angle);
            if (angle) {
                axis.crossVectors(self.rotateStart, self.rotateEnd).normalize();
                angle *= self.rotateSpeed;
                quaternion.setFromAxisAngle(axis, -angle);
                self.position.applyQuaternion(quaternion);
                self.object.up.applyQuaternion(quaternion);
                self.rotateEnd.applyQuaternion(quaternion);
                quaternion.setFromAxisAngle(axis, angle * (self.dampingFactor - 1.0));
                self.rotateStart.applyQuaternion(quaternion);
            }
        });
    })();
    this.getMouseProjectionOnBall = (function(){
        var up = new THREE.Vector3();
        var ball = new THREE.Vector3();

        return (function(x, y, projection){
            ball.set(
                (x - self.screen.width * 0.5 - self.screen.left) / self.screen.width * 0.5,
                (self.screen.height * 0.5 + self.screen.top - y) / (self.screen.height * 0.5),
                0.0
            );

            var length = ball.length();
            if(length > 1.0){
                ball.normalize();
            } else{
                ball.z = Math.sqrt(1.0 - length * length);
            }

            self.position.copy(self.object.position).sub(self.target);
            projection.copy(self.object.up).setLength(ball.y);
            projection.add(up.copy(self.object.up).cross(self.position).setLength(ball.x));
            projection.add(self.position.setLength(ball.z));
            console.log(JSON.stringify(projection));
            return projection;
        });
    })();
    this.update = function(){
        self.position.subVectors(self.object.position, self.target);
        self.rotate();
        self.zoom();
        self.object.position.addVectors(self.target, self.position);
        self.object.lookAt(self.target);
        if(self.lastPosition.distanceToSquared(self.object.position) > 0){
            self.dispatchEvent({ type: "changed" });
            self.lastPosition.copy(self.object.position);
        }
    };
    this.handleEvent = function(e){
        if(typeof this[e.type] == "function"){
            this[e.type](e);
        }
    };
    this.handleResize = function(){
        if(self.dom == document){
            self.screen.left = 0;
            self.screen.top = 0;
            self.screen.width = window.innerWidth;
            self.screen.height = window.innerHeight;
        } else{
            self.screen = self.dom.getBoundingClientRect();
            var d = self.dom.ownerDocument.documentElement;
            self.screen.left += window.pageXOffset - d.clientLeft;
            self.screen.top += window.pageYOffset - d.clientTop;
        }
    };
    this.zoom = function(){
        var factor = 1.0 + (self.zoomEnd.y - self.zoomStart.y) * self.zoomSpeed;
        if(factor !== 1.0 && factor > 0.0){
            self.position.multiplyScalar(factor);
            self.zoomStart.y += (self.zoomEnd.y - self.zoomStart.y) * self.dampingFactor;
        }
    };

    var mouseup = function (e) {
        self.state = State.NONE;
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
    };

    var mousemove = function (e) {
        if (self.state == State.ROTATE) {
            self.getMouseProjectionOnBall(e.pageX, e.pageY, self.rotateEnd);
        }
    };

    var mousedown = function (e) {
        self.state = State.ROTATE;
        self.getMouseProjectionOnBall(e.pageX, e.pageY, self.rotateStart);
        self.rotateEnd.copy(self.rotateStart);

        document.addEventListener("mousemove", mousemove, false);
        document.addEventListener("mouseup", mouseup, false);
    };

    var mousewheel = function(e){
        e.preventDefault();
        e.stopPropagation();

        var delta = 0;
        if(e.wheelDelta){
            delta = e.wheelDelta / 40;
        } else if(e.detail){
            delta = -e.detail / 3;
        }
        self.zoomStart.y += delta * 0.01;
    };

    self.dom.addEventListener("mousewheel", mousewheel, false);
    self.dom.addEventListener("DOMMouseScrool", mousewheel, false);
    self.dom.addEventListener("mousedown", mousedown, false);
    self.handleResize();
};

THREE.TrackBall.prototype = Object.create(THREE.EventDispatcher.prototype);