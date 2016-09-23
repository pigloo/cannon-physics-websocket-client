import * as THREE from 'three';
import AbstractApplication from 'scripts/views/AbstractApplication';
import WebSocketConnection from 'scripts/websocket';
//const glslify = require('glslify');
//const shaderVert = glslify('./../shaders/custom.vert');
//const shaderFrag = glslify('./../shaders/custom.frag');

class Main extends AbstractApplication {
    constructor(){
        super();

        this._sceneObjects = [];
        this._bodyPositions = [];

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
            //roughnessMap: this._texture
          }),
          1: new THREE.MeshStandardMaterial({
            color: 0x9d3131,
            metalness: 0.5,
            roughness: 1,
            //roughnessMap: this._texture
          })
        };

        this._geometries = {
          0: new THREE.SphereBufferGeometry( 0.2, 24, 24 ),
          1: new THREE.SphereBufferGeometry( 0.15, 24, 24 ),
        };

        this.addGround();

        this.addLights();

        this.animate();
    }

    animate() {

        super.animate();

        var len = this._sceneObjects.length;
        for( var i = 0; i < len; i++) {
            this._scene.remove(this._sceneObjects[i]);
        }

        this._sceneObjects = [];

        var frame = this._bodyPositions;
        len = frame.length;

        for(i = 0; i < len; i++){
            if(frame[i] === null){console.log('null');}
            var material = this._materials[frame[i].c];
            var geometry = this._geometries[frame[i].rt];
            var ball = new THREE.Mesh(geometry, material);
            ball.position.copy(frame[i].p);
            ball.quaternion.copy(frame[i].q);
            ball.castShadow = true;
            ball.receiveShadow = true;
            this._sceneObjects.push(ball);
            this._scene.add(ball);
        }
    }

    updateBodyPositions(data){
        var frame = this._bodyPositions;
        for(var i = 0; i < data.length; i++){
            for(var j = 0; j < frame.length; j++){
                if(frame[j].id === data[i].id){
                    frame[j] = data[i];
                }
            }
        }
        this._bodyPositions = frame;
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

        this._scene.add(new THREE.AmbientLight(0x3D4143));

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 20, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 30;
        light.shadow.bias = 0.0001;

        var d = 8;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );

        this._scene.add(light);

        /*
        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(-10, 20, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 30;
        //light.shadow.camera.fov = 70;
        light.shadow.bias = 0.0001;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
        this._scene.add(light);

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );
        */

    }

    addGround(){
        var boxGeometry = new THREE.BoxBufferGeometry(8, 0.5, 8);
        var boxMaterial = new THREE.MeshStandardMaterial({color:0x999999, metalness: 0.5, roughness: 1, roughnessMap: this._texture});
        var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(0,0.74,0);
        boxMesh.receiveShadow = true;
        boxMesh.castShadow = true;
        this._scene.add(boxMesh);
    }

}
export default Main;
