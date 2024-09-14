import * as THREE from "three";

class Player {
  constructor(scene, socket, member = null) {
    this.movement = {
      left: false,
      right: false,
      forward: false,
      backward: false,
    };

    this.scene = scene;
    this.socket = socket;

    this.initModel();

    this.speed = 3;
    this.lean = 0.15;

    if (member) {
      this.mesh.position.copy(member.position);
    }
  }

  emitPosition() {
    this.socket.emit("POSITION", {
      id: this.socket.id,
      position: this.mesh.position,
    });
  }

  initModel() {
    // Pentagon-shaped UFO Body
    const bodyGeometry = new THREE.CylinderGeometry(15, 15, 5);
    const bodyMaterial = new THREE.MeshToonMaterial({
      color: 0x4b7bb9,
      emissive: 0x4b7bb9,
      emissiveIntensity: 0.5,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // UFO Dome (top part)
    const domeGeometry = new THREE.SphereGeometry(10, 32, 2); // Dome shape
    const domeMaterial = new THREE.MeshToonMaterial({
      color: 0xff780a,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
    });
    this.dome = new THREE.Mesh(domeGeometry, domeMaterial);

    // Position the dome on top of the body
    this.dome.position.y = 7; // Adjust Y to sit on top of the disk

    // Group all parts together
    this.mesh = new THREE.Group();
    this.mesh.add(this.body);
    this.mesh.add(this.dome);

    // Add UFO to the scene
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

    this.emitPosition();
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
