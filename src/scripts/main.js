import * as THREE from 'three';
import AbstractApplication from 'scripts/views/AbstractApplication';
import WebSocketConnection from 'scripts/websocket';
//import ModelLoader from 'scripts/ModelLoader';
//const glslify = require('glslify');
//const shaderVert = glslify('./../shaders/custom.vert');
//const shaderFrag = glslify('./../shaders/custom.frag');

class Main extends AbstractApplication {
    constructor(){
        super();

        //var modelLoader = new ModelLoader(this._scene);

        this._sceneObjects = [];
        this._bodyPositions = [];

        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();

        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;
        this._renderer.setClearColor( 0x333333 );

        var callbacks = {
            all: this.updateAllBodies.bind(this),
            update: this.updateBodyPositions.bind(this),
            add: this.addBody.bind(this),
            remove: this.removeBody.bind(this)
        };
        var webSocketConnection = new WebSocketConnection(callbacks);

        this._texture = new THREE.TextureLoader().load( 'textures/rough.jpg' );
        this._texture.wrapS = THREE.RepeatWrapping;
        this._texture.wrapT = THREE.RepeatWrapping;
        this._texture.repeat.set(2, 2);
        this._texture.anisotropy = 16;

        this._materials = {
            0: new THREE.MeshStandardMaterial({
                color: 0x2194ce,
                metalness: 0.5,
                roughness: 1,
                roughnessMap: this._texture,
                //envMap: modelLoader.envTexture
            }),
            1: new THREE.MeshStandardMaterial({
                color: 0x9d3131,
                metalness: 0.5,
                roughness: 1,
                roughnessMap: this._texture,
                //envMap: modelLoader.envTexture
            })
        };

        this._geometries = {
          //0: new THREE.SphereBufferGeometry( 0.2, 24, 24 ),
          //1: new THREE.SphereBufferGeometry( 0.15, 24, 24 ),
          0: new THREE.CylinderBufferGeometry( 0.4, 0.4, 0.1, 32 ),
          1: new THREE.SphereBufferGeometry( 0.15, 24, 24 ),
        };

        //this.addGround();
        this.addFloor();

        this.addLights();

        document.getElementById("canvas").addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
        document.getElementById("canvas").addEventListener('touchstart', this.onDocumentTouchStart.bind(this), false);

        this.animate();

        // https://blockchain.info/block-height/432816?format=json&cors=true

        function getBlockHeight(){

            var date = new Date();
            var milliseconds = date.getTime();

            var request = new XMLHttpRequest();
            request.open('GET', 'https://blockchain.info/blocks/' + milliseconds + '?format=json', true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var resp = request.responseText;
                    var data = JSON.parse(resp);
                    console.log(data);
                } else {
                    // We reached our target server, but it returned an error
                    console.log('Error recieving block height');
                }
            };

            request.onerror = function() {
                // There was a connection error of some sort
            };

            request.send();

        }

        //getBlockHeight();


    }

    animate() {

        super.animate();

        var len = this._sceneObjects.length;
        for( var i = 0; i < len; i++) {
            this._scene.remove(this._sceneObjects[i]);
        }

        this._sceneObjects = [];

        for(i = 0; i < this._bodyPositions.length; i++){
            if(this._bodyPositions[i] === null){console.log('null');}
            var material = this._materials[this._bodyPositions[i].c];
            var geometry = this._geometries[this._bodyPositions[i].rt];
            var ball = new THREE.Mesh(geometry, material);
            ball.bodyId = this._bodyPositions[i].id;
            ball.position.copy(this._bodyPositions[i].p);
            ball.quaternion.copy(this._bodyPositions[i].q);
            ball.castShadow = true;
            ball.receiveShadow = true;
            this._sceneObjects.push(ball);
            this._scene.add(ball);
        }
    }

    updateBodyPositions(data){
        for(var i = 0; i < data.length; i++){
            for(var j = 0; j < this._bodyPositions.length; j++){
                if(this._bodyPositions[j].id === data[i].id){
                    this._bodyPositions[j] = data[i];
                }
            }
        }
    }

    addBody(data){
        this._bodyPositions.push(data);
    }

    removeBody(data){
        for(var i = 0; i < this._bodyPositions.length; i++){
            if(this._bodyPositions[i].id === data.id){
                this._bodyPositions.splice(i,1);
                break;
            }
        }
    }

    updateAllBodies(data){
        this._bodyPositions = [];
        if(data.length > 0){
            this._bodyPositions = data;
        }
    }

    addLights() {

        this._scene.add(new THREE.AmbientLight(0x999999));

        var light = new THREE.DirectionalLight(0x999999, 0.8);
        light.position.set(10, 20, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 40;
        light.shadow.bias = 0.0001;

        var d = 12;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
        this._scene.add(light);

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );

        light = new THREE.DirectionalLight(0x999999, 0.8);
        light.position.set(-10, 20, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 40;
        //light.shadow.camera.fov = 70;
        light.shadow.bias = 0.0001;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
        this._scene.add(light);

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );

        /*
        light = new THREE.PointLight( 0xff0000, 1, 100 );
        light.position.set( 0, -4, 0 );
        this._scene.add( light );
        this._scene.add(new THREE.PointLightHelper(light, 0.1));
        */

    }

    addGround(){
        var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
        var planeMaterial = new THREE.MeshStandardMaterial({color:0x999999, metalness: 0.5, roughness: 1, roughnessMap: this._texture});
        var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.position.set(0,-13.5,0);
        planeMesh.receiveShadow = true;
        //planeMesh.castShadow = true;
        planeMesh.rotation.x = -Math.PI / 2;
        this._scene.add(planeMesh);
    }

    addFloor(){
        var boxGeometry = new THREE.BoxBufferGeometry( 8, 1, 8 );
        var boxMaterial = new THREE.MeshStandardMaterial({color:0x999999, metalness: 0.5, roughness: 1, roughnessMap: this._texture});
        var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(0,-3.5,0);
        boxMesh.receiveShadow = true;
        //planeMesh.castShadow = true;
        this._scene.add(boxMesh);
    }

    onDocumentTouchStart(event) {
        event.preventDefault();

        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        this.onDocumentMouseDown(event);
    }

    onDocumentMouseDown(event) {
        event.preventDefault();

        this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this._camera);

        var intersects = this._raycaster.intersectObjects(this._scene.children);

        if (intersects.length > 0) {
            console.log("intersected with something");
            console.log(intersects[0].object);
            if (intersects[0].object.bodyId === true) {
                console.log(intersects[0].object.bodyId);
            }
        }
    }
}
export default Main;
