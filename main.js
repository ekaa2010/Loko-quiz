

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HomeScene } from './homeScene.js';
import { UIManager } from './uiManager.js';
import { SceneManager } from './sceneManager.js';
import { GameState } from './gameState.js';
import { GameManager } from './gameManager.js';
import { GameScene } from './gameScene.js';
class LokoGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.loader = new GLTFLoader();
        
        this.clock = new THREE.Clock();
        this.mixer = null;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x2c1810);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Initialize managers
        // Initialize managers
        this.gameState = new GameState();
        this.homeScene = new HomeScene(this.scene, this.camera, this.loader);
        this.gameScene = new GameScene(this.scene, this.camera, this.loader);
        this.sceneManager = new SceneManager(this.gameScene);
        
        // Correctly instantiate managers to avoid circular dependency
        this.uiManager = new UIManager(this.sceneManager, this.gameState, this.homeScene, this.gameScene);
        this.gameManager = new GameManager(this.gameState, this.uiManager);
        this.uiManager.setGameManager(this.gameManager); // Inject the dependency
        
        // Setup camera position
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 1, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start the game
        this.homeScene.create().then(() => {
            this.mixer = this.homeScene.mixer;
            this.homeScene.show();
            // Create game scene assets after home scene is ready
            this.gameScene.create().then(() => {
                this.animate();
            });
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update animations
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Update scene based on the current context
        if (this.sceneManager.currentScene === 'GameScreen' || this.sceneManager.currentScene === 'Scoreboard') {
            this.gameScene.update(deltaTime);
        } 
        
        if (this.homeScene.container.visible) {
            this.homeScene.update(deltaTime);
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
new LokoGame();

