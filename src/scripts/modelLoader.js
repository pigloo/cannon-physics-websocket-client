import * as THREE from 'three';
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

class ModelLoader {

    constructor(scene){

        this._scene = scene;

        this._manager = new THREE.LoadingManager();

        this._manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };

        this._loader = new THREE.OBJLoader( this._manager );

        this._envTexture = new THREE.TextureLoader().load( "textures/Soft_5DaylightStudio.png" );
        this._envTexture.mapping = THREE.EquirectangularReflectionMapping;
        this._envTexture.magFilter = THREE.LinearFilter;
        this._envTexture.minFilter = THREE.LinearMipMapLinearFilter;

        this._materials = this.materials();

        this.loadFunnel();
        this.loadMachine();

    }

    onProgress( xhr ) {

        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }

    }

    onError( xhr ) {

        console.log("Error loading OBJ file");
        console.log(xhr);

    }

    loadFunnel(){
        var self = this;

        this._loader.load( 'models/funnel.obj', function ( object ) {

            var material = self._materials.funnelMaterial;

            object.traverse( function( child ){
                //child.castShadow = true;
                child.receiveShadow = true;
                child.material = material;
                child.material.shading = THREE.SmoothShading;
            });

            self._scene.add(object);

        }, this.onProgress, this.onError );
    }

    loadMachine(){
        var self = this;

        this._loader.load( 'models/bitcoinomatic.obj', function ( object ) {

            //console.log(object);

            object.traverse( function( child ){
                child.castShadow = true;
                child.receiveShadow = true;
            });

            object.children[0].material = self._materials.wiresMaterial; // Wires
            object.children[1].material = self._materials.stripMaterial; // Strip
            object.children[2].material = self._materials.pannelMaterial; // Pannel
            object.children[3].material = self._materials.bodyMaterial; // Body

            object.position.set(0,-13.5,0);

            self._scene.add(object);

        }, this.onProgress, this.onError );
    }

    get envTexture(){

        return this._envTexture;

    }

    materials(){

        var loader = new THREE.TextureLoader(this._manager);

        var textures = {
            bodyColor:    loader.load( 'textures/Material.003_Base_Color.png' ),
            bodyRough:    loader.load( 'textures/Material.003_Roughness.png' ),
            bodyMetal:    loader.load( 'textures/Material.003_Metallic.png' ),
            bodyNormal:   loader.load( 'textures/Material.003_Normal.png' ),
            bodyAo:       loader.load( 'textures/Material.003_Mixed_AO.png' ),
            pannelColor:  loader.load( 'textures/Material.002_Base_Color.png' ),
            pannelRough:  loader.load( 'textures/Material.002_Roughness.png' ),
            pannelMetal:  loader.load( 'textures/Material.002_Metallic.png' ),
            pannelNormal: loader.load( 'textures/Material.002_Normal.png' ),
            pannelAo:     loader.load( 'textures/Material.002_Mixed_AO.png' ),
            stripColor:   loader.load( 'textures/Material.001_Base_Color.png' ),
            stripRough:   loader.load( 'textures/Material.001_Roughness.png' ),
            stripMetal:   loader.load( 'textures/Material.001_Metallic.png' ),
            stripNormal:  loader.load( 'textures/Material.001_Normal.png' ),
            stripAo:      loader.load( 'textures/Material.001_Mixed_AO.png' ),
            wiresColor:   loader.load( 'textures/Material.004_Base_Color.png' ),
            wiresRough:   loader.load( 'textures/Material.004_Roughness.png' ),
            wiresMetal:   loader.load( 'textures/Material.004_Metallic.png' ),
            wiresNormal:  loader.load( 'textures/Material.004_Normal_OpenGL.png' ),
            wiresAo:      loader.load( 'textures/Material.004_Mixed_AO.png' ),
            funnelRough:  loader.load( 'textures/rough.jpg' )
        };

        textures.bodyColor.anisotropy = 16;
        textures.pannelColor.anisotropy = 16;
        textures.stripColor.anisotropy = 16;
        textures.wiresColor.anisotropy = 16;

        var materials = {
            bodyMaterial: new THREE.MeshStandardMaterial({
                map: textures.bodyColor,
                aoMap: textures.bodyAo,
                normalMap: textures.bodyNormal,
                roughnessMap: textures.bodyRough,
                metalnessMap: textures.bodyMetal,
                metalness: 0.5,
                roughness: 1,
                envMap: this._envTexture,
                envMapIntensity: 0.5
            }),
            pannelMaterial: new THREE.MeshStandardMaterial({
                map: textures.pannelColor,
                aoMap: textures.pannelAo,
                normalMap: textures.pannelNormal,
                roughnessMap: textures.pannelRough,
                metalnessMap: textures.pannelMetal,
                metalness: 0.4,
                roughness: 1,
                envMap: this._envTexture,
                envMapIntensity: 0.5
            }),
            stripMaterial: new THREE.MeshStandardMaterial({
                map: textures.stripColor,
                aoMap: textures.stripAo,
                normalMap: textures.stripNormal,
                roughnessMap: textures.stripRough,
                metalnessMap: textures.stripMetal,
                metalness: 0.5,
                roughness: 1,
                envMap: this._envTexture,
                envMapIntensity: 0.5
            }),
            wiresMaterial: new THREE.MeshStandardMaterial({
                map: textures.wiresColor,
                aoMap: textures.wiresAo,
                normalMap: textures.wiresNormal,
                roughnessMap: textures.wiresRough,
                //metalnessMap: textures.wiresMetal,
                metalness: 0,
                roughness: 1,
                envMap: this._envTexture,
                envMapIntensity: 0.2
            }),
            funnelMaterial: new THREE.MeshStandardMaterial({
                color:0x999999,
                metalness: 0.4,
                roughness: 0.6,
                roughnessMap: textures.funnelRough,
                transparent: true,
                opacity: 0.6,
                refractionRatio: 0.2,
                envMap: this._envTexture
            })

        };

        return materials;

    }

}

export default ModelLoader;
