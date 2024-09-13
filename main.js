import * as THREE from "three";
import Player from "./player.js";
import Weapon from "./weapon.js";
import Enemies from "./enemies.js";

class Game {
  constructor() {
    this.initScene();
    this.initPlayer();
    this.initWeapon();
    this.initEnemies();
    this.addEventListeners();
    this.animate();
    this.playerHeight = 250;
    this.playerDistance = 75;
  }

  initScene() {
    this.scene = new THREE.Scene();

    // Perspective camera for 3D effect
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 200, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load("textures/grass.png");

    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(40, 40);

    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = 0;
    this.ground.receiveShadow = true;

    this.scene.add(this.ground);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  initPlayer() {
    this.player = new Player(this.scene);
    this.scene.add(this.player.mesh);
  }

  initWeapon() {
    this.weapon = new Weapon(this.scene, this.player, this.camera, this.ground);
  }

  initEnemies() {
    this.enemies = new Enemies(this.scene, this.player);
  }

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  addEventListeners() {
    document.addEventListener(
      "keydown",
      this.player.onKeyDown.bind(this.player)
    );
    document.addEventListener("keyup", this.player.onKeyUp.bind(this.player));

    document.addEventListener("wheel", (event) => {
      if (this.playerDistance < 75 && event.deltaY < 0) return;
      if (this.playerDistance > 250 && event.deltaY > 0) return;
      this.playerDistance += event.deltaY * 0.1;
      this.playerHeight += event.deltaY * 0.1;
    });

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
    this.enemies.update();

    const playerPosition = this.player.mesh.position;
    this.camera.position.x = playerPosition.x;
    this.camera.position.y = playerPosition.y + this.playerHeight;
    this.camera.position.z = playerPosition.z + this.playerDistance;

    this.camera.lookAt(playerPosition);

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
