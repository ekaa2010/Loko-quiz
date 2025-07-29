

import * as THREE from 'three';

export class HomeScene {
    constructor(scene, camera, loader) {
        this.scene = scene;
        this.camera = camera;
        this.loader = loader;
        this.container = new THREE.Group();
        this.mixer = null;
        this.character = null;
        this.doors = [];
        
        // Animation properties
        this.time = 0;
        this.particles = [];
        
        this.scene.add(this.container);
    }
    
    async create() {
        this.container.visible = false; // Initially hidden
        this.setupLighting();
        this.createEnvironment();
        await this.loadAssets();
        this.createParticles();
    }
    
    setupLighting() {
        // Ambient light for overall warmth
        const ambientLight = new THREE.AmbientLight(0xff9966, 0.4);
        this.container.add(ambientLight);
        
        // Main warm light
        const mainLight = new THREE.DirectionalLight(0xffaa44, 0.8);
        mainLight.position.set(-5, 8, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.container.add(mainLight);
        
        // Secondary warm light
        const secondaryLight = new THREE.PointLight(0xff6644, 0.6, 15);
        secondaryLight.position.set(3, 4, -2);
        this.container.add(secondaryLight);
        
        // Accent light
        const accentLight = new THREE.SpotLight(0xffdd33, 0.5, 10, Math.PI / 6);
        accentLight.position.set(0, 6, 3);
        accentLight.target.position.set(0, 0, 0);
        this.container.add(accentLight);
        this.container.add(accentLight.target);
        
        // Add subtle fog for atmosphere
        // Note: Fog is set on the main scene, not the container
        this.scene.fog = new THREE.Fog(0x2c1810, 8, 20);
    }
    
    createEnvironment() {
        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.container.add(floor);
        
        // Create walls
        this.createWalls();
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(20, 10);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, 5, -10);
        this.container.add(backWall);
        
        // Side walls
        const sideWallGeometry = new THREE.PlaneGeometry(20, 10);
        
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.set(-10, 5, 0);
        leftWall.rotation.y = Math.PI / 2;
        this.container.add(leftWall);
        
        const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        rightWall.position.set(10, 5, 0);
        rightWall.rotation.y = -Math.PI / 2;
        this.container.add(rightWall);
    }
    
    async loadAssets() {
        try {
            // Load animated woman
            const womanModel = await this.loadModel('https://play.rosebud.ai/assets/Animated Woman.glb?dRpr');
            if (womanModel) {
                this.character = womanModel.scene;
                this.character.position.set(-3, 0, 2);
                this.character.scale.setScalar(1.2);
                this.character.rotation.y = Math.PI / 4;
                
                this.character.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                this.container.add(this.character);
                
                // Setup animation mixer
                if (womanModel.animations && womanModel.animations.length > 0) {
                    this.mixer = new THREE.AnimationMixer(this.character);
                    const waveAction = this.mixer.clipAction(womanModel.animations.find(anim => 
                        anim.name.includes('Wave') || anim.name.includes('Idle')
                    ) || womanModel.animations[0]);
                    waveAction.play();
                }
            }
            
            // Load doors
            await this.loadDoors();
            
        } catch (error) {
            console.log('Some assets could not load, continuing with basic scene');
        }
    }
    
    async loadDoors() {
        const doorPositions = [
            { x: -6, z: -9, rotation: 0 },
            { x: 6, z: -9, rotation: 0 },
            { x: 9, z: -3, rotation: Math.PI / 2 }
        ];
        
        for (let i = 0; i < doorPositions.length; i++) {
            try {
                const doorUrls = [
                    'https://play.rosebud.ai/assets/Wooden Door Rounded.glb?mxad',
                    'https://play.rosebud.ai/assets/Wooden Door Rounded.glb?klfi',
                    'https://play.rosebud.ai/assets/Wooden Door Rounded.glb?woxZ'
                ];
                
                const doorModel = await this.loadModel(doorUrls[i % doorUrls.length]);
                if (doorModel) {
                    const door = doorModel.scene;
                    const pos = doorPositions[i];
                    
                    door.position.set(pos.x, 0, pos.z);
                    door.rotation.y = pos.rotation;
                    door.scale.setScalar(0.8);
                    
                    door.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    this.doors.push(door);
                    this.container.add(door);
                }
            } catch (error) {
                console.log(`Door ${i} could not load`);
            }
        }
    }
    
    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, resolve, undefined, reject);
        });
    }
    
    createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = Math.random() * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffeb3b,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.container.add(this.particles);
    }
    
    update(deltaTime) {
        if (!this.container.visible) return;
        this.time += deltaTime;
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += deltaTime * 0.2;
            const positions = this.particles.geometry.attributes.position.array;
            
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += Math.sin(this.time + i) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Gentle camera sway
        this.camera.position.x = Math.sin(this.time * 0.5) * 0.3;
        this.camera.position.y = 2 + Math.cos(this.time * 0.3) * 0.1;
    }
    
    show() {
        this.container.visible = true;
    }
    hide() {
        this.container.visible = false;
    }
}

