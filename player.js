import * as THREE from "three";

class Player {
  constructor(scene) {
    this.movement = {
      left: false,
      right: false,
      forward: false,
      backward: false,
    };

    this.scene = scene;
    this.initModel();

    this.speed = 3;
    this.lean = 0.15;
  }

  initModel() {
    // Bird Body (Ellipsoid shape)
    const bodyGeometry = new THREE.SphereGeometry(15, 32, 32); // Ellipsoid for the body
    const bodyMaterial = new THREE.MeshToonMaterial({
      color: 0x4b7bb9,
      emissive: 0x4b7bb9,
      emissiveIntensity: 0.5,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.scale.set(1, 1.5, 1); // Scale to make the body more oval-shaped (bird-like)

    // Bird Head (small sphere)
    const headGeometry = new THREE.SphereGeometry(8, 32, 32); // Smaller sphere for head
    const headMaterial = new THREE.MeshToonMaterial({
      color: 0xff780a,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 20; // Position the head on top of the body

    // Bird Beak (Cone shape)
    const beakGeometry = new THREE.ConeGeometry(3, 6, 32); // Small cone for the beak
    const beakMaterial = new THREE.MeshToonMaterial({
      color: 0xffd700, // Yellow color for beak
      emissive: 0xffa500,
      emissiveIntensity: 0.5,
    });
    this.beak = new THREE.Mesh(beakGeometry, beakMaterial);
    this.beak.position.set(0, 18, 13); // Position the beak in front of the head
    this.beak.rotation.x = Math.PI / 2; // Rotate to point outward

    // Bird Wings (Scaled box for simplicity)
    const wingGeometry = new THREE.BoxGeometry(2, 8, 20); // Wing shape
    const wingMaterial = new THREE.MeshToonMaterial({
      color: 0x4b7bb9,
      emissive: 0x4b7bb9,
      emissiveIntensity: 0.5,
    });
    this.leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    this.leftWing.position.set(-16, 10, 0); // Position the left wing on the side of the body
    this.rightWing.position.set(16, 10, 0); // Position the right wing on the other side
    this.leftWing.rotation.z = Math.PI / 4; // Rotate the wings slightly upwards
    this.rightWing.rotation.z = -Math.PI / 4;

    // Bird Tail (Cone shape for simplicity)
    const tailGeometry = new THREE.ConeGeometry(5, 10, 32); // Tail shape
    const tailMaterial = new THREE.MeshToonMaterial({
      color: 0x4b7bb9,
      emissive: 0x4b7bb9,
      emissiveIntensity: 0.5,
    });
    this.tail = new THREE.Mesh(tailGeometry, tailMaterial);
    this.tail.position.set(0, -10, -15); // Position the tail at the back of the body
    this.tail.rotation.x = Math.PI / 2; // Pointing backward

    // Group all parts together
    this.mesh = new THREE.Group();
    this.mesh.add(this.body);
    this.mesh.add(this.head);
    this.mesh.add(this.beak);
    this.mesh.add(this.leftWing);
    this.mesh.add(this.rightWing);
    this.mesh.add(this.tail);

    // Add Bird to the scene
    this.scene.add(this.mesh);
  }

  // Move the player based on movement input
  update() {
    this.mesh.rotation.x = 0;
    this.mesh.rotation.z = 0;
    this.mesh.position.y = 100;

    if (this.movement.forward) this.mesh.position.z -= this.speed;
    if (this.movement.backward) this.mesh.position.z += this.speed;
    if (this.movement.left) this.mesh.position.x -= this.speed;
    if (this.movement.right) this.mesh.position.x += this.speed;

    // Adjust lean
    if (this.movement.forward) this.mesh.rotation.x = -this.lean;
    if (this.movement.backward) this.mesh.rotation.x = this.lean;
    if (this.movement.left) this.mesh.rotation.z = this.lean;
    if (this.movement.right) this.mesh.rotation.z = -this.lean;
  }

  // Handle keydown events
  onKeyDown(event) {
    switch (event.key) {
      case "w":
        this.movement.forward = true;
        break;
      case "a":
        this.movement.left = true;
        break;
      case "s":
        this.movement.backward = true;
        break;
      case "d":
        this.movement.right = true;
        break;
    }
  }

  // Handle keyup events
  onKeyUp(event) {
    switch (event.key) {
      case "w":
        this.movement.forward = false;
        break;
      case "a":
        this.movement.left = false;
        break;
      case "s":
        this.movement.backward = false;
        break;
      case "d":
        this.movement.right = false;
        break;
    }
  }
}

export default Player;
