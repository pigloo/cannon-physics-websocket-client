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

        var webSocketConnection = new WebSocketConnection(this.updateObjectList.bind(this));

        this._material = new THREE.MeshStandardMaterial({
          color: 0x2194ce,
          metalness: 0.5,
          roughness: 1
        });
        this._geometry = new THREE.SphereBufferGeometry( 0.2, 24, 24 );

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

        len = this._objectPositions.length;
        for(i = 0; i < len; i++){
            if(this._objectPositions[i] !== null){
                var ball = new THREE.Mesh(this._geometry, this._material);
                ball.position.copy(this._objectPositions[i].position);
                ball.quaternion.copy(this._objectPositions[i].rotation);
                ball.castShadow = true;
                ball.receiveShadow = true;
                this._sceneObjects.push(ball);
                this._scene.add(ball);
            }
        }

        //console.log(this._scene);
    }

    updateObjectList(data){
        this._objectPositions = [];
        if(data.length !== 0){
            this._objectPositions = data;
        }

    }

    addLights() {

        this._scene.add(new THREE.AmbientLight(0x3D4143));

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 6, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 20;
        light.shadow.bias = 0.0001;

        var d = 8;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );

        this._scene.add(light);

        light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(-10, 6, 0);
        //light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.camera.near = 0;
        light.shadow.camera.far = 20;
        //light.shadow.camera.fov = 70;
        light.shadow.bias = 0.0001;

        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
        this._scene.add(light);

        //this._scene.add( new THREE.CameraHelper( light.shadow.camera ) );

    }

    addGround(){
        var boxGeometry = new THREE.BoxBufferGeometry(8, 2, 8);
        var boxMaterial = new THREE.MeshStandardMaterial({color:0x999999, metalness: 0.5, roughness: 1});
        var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(0,-8,0);
        boxMesh.receiveShadow = true;
        boxMesh.castShadow = true;
        this._scene.add(boxMesh);
    }

}
export default Main;
