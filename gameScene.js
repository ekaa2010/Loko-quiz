

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import TWEEN from 'tween.js';

export class GameScene {
    constructor(scene, camera, loader) {
        this.scene = scene;
        this.camera = camera;
        this.loader = loader;
        this.mixer = null;
        this.character = null;
        this.box = null;
        this.winnerCharacter = null;
        this.winnerMixer = null;
        this.questionPaper = null;
        this.actions = {}; // To store character animations
        this.sparkParticles = null;
        this.visible = false;
    }

    async create() {
        // Create a group to hold all game screen objects
        this.container = new THREE.Group();
        this.scene.add(this.container);

        this.createBox();
        this.setupLighting();
        this.createQuestionPaper();
        this.createSparkParticles();
        await this.loadCharacter();
        await this.loadWinnerCharacter();
        
        this.container.visible = false; // Initially hidden
    }
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x604080, 0.6);
        this.container.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(-5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.container.add(directionalLight);
        const pointLight = new THREE.PointLight(0xffeb3b, 0.5, 20);
        pointLight.position.set(2, 4, 3);
        this.container.add(pointLight);
    }
    createBox() {
        const boxGroup = new THREE.Group();
        this.box = boxGroup;
        const mainMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a148c,
            roughness: 0.5,
            metalness: 0.3
        });
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            metalness: 0.8,
            roughness: 0.2
        });
        // Box Base
        const baseGeometry = new THREE.BoxGeometry(2, 1, 1.5);
        const base = new THREE.Mesh(baseGeometry, mainMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        boxGroup.add(base);
        // Box Lid
        this.lid = new THREE.Group();
        const lidGeometry = new THREE.BoxGeometry(2, 0.2, 1.5);
        const lidMesh = new THREE.Mesh(lidGeometry, mainMaterial);
        lidMesh.castShadow = true;
        this.lid.add(lidMesh);
        // Lid handle
        const handleGeom = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
        const handle = new THREE.Mesh(handleGeom, accentMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.y = 0.15;
        this.lid.add(handle);
        // Position lid relative to its rotation point (the back)
        this.lid.position.set(0, 0.5, -0.75);
        lidMesh.position.set(0, 0, 0.75);
        boxGroup.add(this.lid);
        
        boxGroup.position.set(1.5, 0.5, 0);
        this.container.add(boxGroup);
        
        // Add floating animation
        new TWEEN.Tween(this.box.position)
            .to({ y: this.box.position.y + 0.2 }, 2500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start();
    }
    createQuestionPaper() {
        const paperCanvas = document.createElement('canvas');
        const ctx = paperCanvas.getContext('2d');
        paperCanvas.width = 256;
        paperCanvas.height = 256;
        ctx.fillStyle = '#fdfdf3';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#333';
        ctx.font = 'bold 150px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 128, 128);
        const texture = new THREE.CanvasTexture(paperCanvas);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            roughness: 0.9,
        });
        const geometry = new THREE.PlaneGeometry(1.2, 1.2);
        this.questionPaper = new THREE.Mesh(geometry, material);
        this.questionPaper.position.set(0, 0.1, 0); // Start inside the box
        this.questionPaper.rotation.x = -Math.PI / 2; // Laying flat
        this.questionPaper.visible = false;
        this.box.add(this.questionPaper);
    }
    createSparkParticles() {
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        const velocities = []; // Store velocity and life
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            velocities.push({ 
                velocity: new THREE.Vector3(),
                life: 0 
            });
        }
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffeb3b,
            size: 0.15,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false, // Important for blending
            opacity: 0
        });
        this.sparkParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.sparkParticles.velocities = velocities;
        this.sparkParticles.visible = false;
        this.box.add(this.sparkParticles);
    }
    async loadCharacter() {
        try {
            const model = await this.loader.loadAsync('https://play.rosebud.ai/assets/Animated Woman.glb?viP6');
            this.character = model.scene;
            this.character.scale.setScalar(1.2);
            this.character.position.set(-2, 0, 0); // Start position
            this.character.rotation.y = Math.PI / 2; // Face the box

            this.character.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            this.mixer = new THREE.AnimationMixer(this.character);
            const idleAction = this.mixer.clipAction(model.animations.find(a => a.name.includes('Idle_Gun')));
            this.actions['idle'] = idleAction;
            const correctAction = this.mixer.clipAction(model.animations.find(a => a.name.includes('Wave')));
            correctAction.setLoop(THREE.LoopOnce);
            correctAction.clampWhenFinished = true;
            this.actions['correct'] = correctAction;
            const incorrectAction = this.mixer.clipAction(model.animations.find(a => a.name.includes('HitRecieve')));
            incorrectAction.setLoop(THREE.LoopOnce);
            incorrectAction.clampWhenFinished = true;
            this.actions['incorrect'] = incorrectAction;
            
            this.actions['idle'].play();
            this.container.add(this.character);
        } catch (error) {
            console.error('Failed to load character for game scene:', error);
        }
    }
    async loadWinnerCharacter() {
        try {
            const model = await this.loader.loadAsync('https://play.rosebud.ai/assets/Green Blob.glb?yLVJ');
            this.winnerCharacter = model.scene;
            this.winnerCharacter.scale.setScalar(2);
            this.winnerCharacter.position.set(0, 0, 4); // Positioned for the winner scene
            this.winnerCharacter.visible = false; // Hidden until game over
            this.winnerCharacter.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            this.winnerMixer = new THREE.AnimationMixer(this.winnerCharacter);
            const danceAction = this.winnerMixer.clipAction(model.animations.find(a => a.name.includes('Dance')));
            danceAction.play();
            this.scene.add(this.winnerCharacter); // Add directly to the main scene
        } catch (error) {
            console.error('Failed to load winner character:', error);
        }
    }
    
    show() {
        this.container.visible = true;
        this.visible = true;
        // Logic to start animations will go here
    }

    hide() {
        if (this.container) this.container.visible = false;
        this.visible = false;
    }
    showWinner() {
        // Hide the regular game elements
        new TWEEN.Tween(this.container.scale)
            .to({ x: 0.001, y: 0.001, z: 0.001 }, 500)
            .easing(TWEEN.Easing.Back.In)
            .onComplete(() => this.container.visible = false)
            .start();
        // Animate camera to the winner's position
        const targetPosition = new THREE.Vector3(0, 1.5, 8);
        const targetLookAt = this.winnerCharacter.position.clone().add(new THREE.Vector3(0, 1, 0));
        new TWEEN.Tween(this.camera.position)
            .to(targetPosition, 1200)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.camera.lookAt(targetLookAt);
            })
            .start();
        if (this.winnerCharacter) {
            this.winnerCharacter.visible = true;
        }
    }
    update(deltaTime) {
        if (!this.visible && !this.winnerCharacter?.visible) return;
        TWEEN.update(); // Update tween animations
        if (this.visible && this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        if (this.winnerCharacter?.visible && this.winnerMixer) {
            this.winnerMixer.update(deltaTime);
        }
        
        if (this.sparkParticles && this.sparkParticles.visible) {
            this.updateSparkParticles(deltaTime);
        }
    }
    
    updateSparkParticles(deltaTime) {
        const positions = this.sparkParticles.geometry.attributes.position.array;
        const velocities = this.sparkParticles.velocities;
        let activeParticles = 0;
        for (let i = 0; i < velocities.length; i++) {
            if (velocities[i].life > 0) {
                activeParticles++;
                velocities[i].life -= deltaTime;
                positions[i * 3] += velocities[i].velocity.x * deltaTime;
                positions[i * 3 + 1] += velocities[i].velocity.y * deltaTime;
                positions[i * 3 + 2] += velocities[i].velocity.z * deltaTime;
                // Apply some gravity
                velocities[i].velocity.y -= 2 * deltaTime;
            }
        }
        
        this.sparkParticles.geometry.attributes.position.needsUpdate = true;
        if (activeParticles === 0) {
            this.sparkParticles.visible = false;
            this.sparkParticles.material.opacity = 0;
        }
    }
    
    resetBox() {
        if (!this.lid) return;
        this.lid.rotation.x = 0;
        if (this.questionPaper) {
            this.questionPaper.visible = false;
            this.questionPaper.position.set(0, 0.1, 0);
            this.questionPaper.rotation.set(-Math.PI / 2, 0, 0);
        }
    }
    
    playReactionAnimation(isCorrect) {
        const actionToPlay = isCorrect ? this.actions.correct : this.actions.incorrect;
        
        // Reset and play the reaction animation
        actionToPlay.reset().play();
        
        // Fade out the reaction animation and fade in the idle animation
        this.mixer.addEventListener('finished', () => {
             // This listener might fire for other animations, so check which one finished.
            if (this.mixer.existingAction(actionToPlay)) {
                 actionToPlay.fadeOut(0.5);
                 this.actions.idle.reset().fadeIn(0.5).play();
            }
        });
    }
    
    playUnlockSequence(onComplete) {
        if (!this.lid || !this.questionPaper) return;
        // Animate the lid opening
        new TWEEN.Tween(this.lid.rotation)
            .to({ x: -Math.PI / 1.5 }, 1000) // Rotate lid up
            .easing(TWEEN.Easing.Cubic.Out)
            .onStart(() => {
                // Trigger sparks when the lid starts opening
                this.triggerSparks();
            })
            .start();
        // Animate the paper coming out, starting slightly after the lid begins to open
        this.questionPaper.visible = true;
        const paperTargetPos = new THREE.Vector3(0, 1.5, 0.5);
        const paperTargetRot = new THREE.Vector3(0, 0, 0);
        new TWEEN.Tween(this.questionPaper.position)
            .to(paperTargetPos, 1500)
            .easing(TWEEN.Easing.Back.Out)
            .delay(400) // Start after lid has opened a bit
            .start();
        new TWEEN.Tween(this.questionPaper.rotation)
            .to(paperTargetRot, 1500)
            .easing(TWEEN.Easing.Back.Out)
            .delay(400)
            .onComplete(onComplete) // Call the main callback when the paper is in place
            .start();
    }
    triggerSparks() {
        this.sparkParticles.visible = true;
        this.sparkParticles.material.opacity = 1;
        const velocities = this.sparkParticles.velocities;
        const positions = this.sparkParticles.geometry.attributes.position.array;
        for (let i = 0; i < velocities.length; i++) {
            // Reset position to center of the box top
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0.5;
            positions[i * 3 + 2] = 0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const speed = Math.random() * 2 + 1;
            velocities[i].velocity.set(
                speed * Math.sin(phi) * Math.cos(theta),
                speed * Math.cos(phi) + 1.5, // Bias upwards
                speed * Math.sin(phi) * Math.sin(theta)
            );
            
            velocities[i].life = Math.random() * 1.5 + 0.5; // Lifespan of 0.5 to 2 seconds
        }
        this.sparkParticles.geometry.attributes.position.needsUpdate = true;
    }
}