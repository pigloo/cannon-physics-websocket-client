import * as THREE from 'three';
import AbstractApplication from 'scripts/views/AbstractApplication';
import WebSocketConnection from 'scripts/websocket';
const glslify = require('glslify');
const shaderVert = glslify('./../shaders/custom.vert');
const shaderFrag = glslify('./../shaders/custom.frag');

class Main extends AbstractApplication {
    constructor(){
        super();

        this._sceneObjects = [];
        this._objectPositions = [];

        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;
        this._renderer.setClearColor( 0x333333 );

        var callbacks = {
            all: this.allBalls.bind(this),
            update: this.updateObjectList.bind(this),
            add: this.addBall.bind(this),
            remove: this.removeBall.bind(this)
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
            roughnessMap: this._texture
          }),
          1: new THREE.MeshStandardMaterial({
            color: 0x9d3131,
            metalness: 0.5,
            roughness: 1,
            roughnessMap: this._texture
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
        this.updateBalls();
        /*
        var len = this._sceneObjects.length;
        for( var i = 0; i < len; i++) {
            this._scene.remove(this._sceneObjects[i]);
        }

        this._sceneObjects = [];

        len = this._objectPositions.length;
        for(i = 0; i < len; i++){
            if(this._objectPositions[i] !== null){
                var material = this._materials[this._objectPositions[i].c];
                var geometry = this._geometries[this._objectPositions[i].rt];
                var ball = new THREE.Mesh(geometry, material);
                ball.position.copy(this._objectPositions[i].p);
                ball.quaternion.copy(this._objectPositions[i].r);
                ball.castShadow = true;
                ball.receiveShadow = true;
                this._sceneObjects.push(ball);
                this._scene.add(ball);
            }
        }
        */
    }

    allBalls(data){
        for(var i=0;i<data.length;i++){
            var ball = this.addBall(data[i]);
        }
    }

    updateBalls(){
        var data = this._objectPositions;
        for(var i = 0; i < data.length; i++){
            for(var j = 0; j < this._sceneObjects.length; j++){
                if(data[i] !== null && data[i].id === this._sceneObjects[j].bid){
                  this._sceneObjects[j].position.copy(data[i].p);
                  this._sceneObjects[j].quaternion.copy(data[i].q);
                }
            }
        }
    }

    addBall(data){
        var material = this._materials[data.c];
        var geometry = this._geometries[data.rt];
        var ball = new THREE.Mesh(geometry, material);
        ball.position.copy(data.p);
        ball.quaternion.copy(data.q);
        ball.bid = data.id;
        ball.castShadow = true;
        ball.receiveShadow = true;

        this._scene.add(ball);
        this._sceneObjects.push(ball);
    }

    removeBall(data){
        //var len = this._sceneObjects.length;
        for(var i = 0; i < this._sceneObjects.length; i++){
            if(!this._sceneObjects[i].bid){ console.log(this._sceneObjects[i]); }
            if(this._sceneObjects[i].bid === data.id){
                this._scene.remove(this._sceneObjects[i]);
                this._sceneObjects.splice(i,1);
            }
        }
    }

    updateObjectList(data){
        this._objectPositions = [];
        if(data.length > 0){
            this._objectPositions = data;
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
