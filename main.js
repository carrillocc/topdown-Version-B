import * as THREE from "three";
import Player from "./player.js";
import Weapon from "./weapon.js";

class Game {
  constructor() {
    this.initScene();
    this.initPlayer();
    this.initWeapon();
    this.addEventListeners();
    this.animate();
    this.playerHeight = 250;
    this.playerDistance = 75;
  }

  initScene() {
    this.scene = new THREE.Scene();

    // Perspective camera for 3D effect
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    // Position the camera behind and above the player, looking at the player
    this.camera.position.set(0, 200, 30); // Adjust the Y (height) and Z (distance)
    this.camera.lookAt(0, 0, 0); // Look at the origin (the player)

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("textures/grass.png"); // Load grass texture

    groundTexture.wrapS = THREE.RepeatWrapping; // Repeat the texture horizontally
    groundTexture.wrapT = THREE.RepeatWrapping; // Repeat the texture vertically
    groundTexture.repeat.set(40, 40); // How many times the texture repeats on the plane

    // Ground with texture
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2; // Lay flat
    this.ground.position.y = 0;

    // Allow the ground to receive shadows
    this.ground.receiveShadow = true;

    this.scene.add(this.ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  // Initialize the player
  initPlayer() {
    this.player = new Player(this.scene);
    this.scene.add(this.player.mesh);
  }

  initWeapon() {
    this.weapon = new Weapon(this.scene, this.player, this.camera, this.ground);
    // this.scene.add(this.weapon.mesh);
  }

  // Handle window resizing
  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.left = -window.innerWidth / 2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = -window.innerHeight / 2;
    this.camera.updateProjectionMatrix();
  }

  addEventListeners() {
    document.addEventListener(
      "keydown",
      this.player.onKeyDown.bind(this.player)
    );
    document.addEventListener("keyup", this.player.onKeyUp.bind(this.player));
    // On scroll, change the distance of the camera from the player
    document.addEventListener("wheel", (event) => {
      if (this.playerDistance < 75 && event.deltaY < 0) return;
      if (this.playerDistance > 250 && event.deltaY > 0) return;
      this.playerDistance += event.deltaY * 0.1;
      this.playerHeight += event.deltaY * 0.1;
    });

    // bind weapons
    document.addEventListener(
      "mousedown",
      this.weapon.onMouseDown.bind(this.weapon)
    );
    document.addEventListener(
      "mousemove",
      this.weapon.onMouseMove.bind(this.weapon)
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.player.update();

    const playerPosition = this.player.mesh.position;

    this.camera.position.x = playerPosition.x;
    this.camera.position.y = playerPosition.y + this.playerHeight;
    this.camera.position.z = playerPosition.z + this.playerDistance;

    this.camera.lookAt(playerPosition);

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
