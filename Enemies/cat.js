import * as THREE from "three";

class Cats {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.enemies = [];
    this.enemySpeed = 0.5; // Enemy Speed

    this.spawnEnemies(5); // Spawn 5 enemies
  }

  createEnemySpeed() {
    return this.speed;
  }

  // Create enemy cat models
  createCat() {
    const catGroup = new THREE.Group(); // Group to hold all parts of the cat

    // Cat Body
    const bodyGeometry = new THREE.BoxGeometry(20, 10, 10);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 5, 0); // Raise body above ground

    // Cat Head
    const headGeometry = new THREE.BoxGeometry(8, 8, 8);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 10, -12); // Position head in front of body

    // Cat Legs (4 legs)
    const legGeometry = new THREE.BoxGeometry(3, 5, 3);
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(-8, 2.5, -5);

    const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontRightLeg.position.set(8, 2.5, -5);

    const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    backLeftLeg.position.set(-8, 2.5, 5);

    const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    backRightLeg.position.set(8, 2.5, 5);

    // Cat Tail
    const tailGeometry = new THREE.CylinderGeometry(1, 1, 15, 12);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 8, 8);
    tail.rotation.x = Math.PI / 4; // Rotate tail slightly upward

    // Cat Ears
    const earGeometry = new THREE.ConeGeometry(2, 4, 4);
    const earMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-3, 14, -15);
    leftEar.rotation.z = Math.PI / 4;

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(3, 14, -15);
    rightEar.rotation.z = -Math.PI / 4;

    // Add all parts to the cat group
    catGroup.add(body);
    catGroup.add(head);
    catGroup.add(frontLeftLeg);
    catGroup.add(frontRightLeg);
    catGroup.add(backLeftLeg);
    catGroup.add(backRightLeg);
    catGroup.add(tail);
    catGroup.add(leftEar);
    catGroup.add(rightEar);

    // Position the entire cat randomly on the ground
    catGroup.position.set(
      Math.random() * 2000 - 1000,
      5,
      Math.random() * 2000 - 1000
    );

    return catGroup;
  }

  // Spawn a number of enemies
  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      const cat = this.createCat();
      this.enemies.push(cat);
      this.scene.add(cat);
    }
  }

  // Update enemies to chase player
  update() {
    this.enemies.forEach((enemy) => {
      const direction = new THREE.Vector3();
      direction
        .subVectors(this.player.mesh.position, enemy.position)
        .normalize();

      // Move enemy towards player
      enemy.position.add(direction.multiplyScalar(this.enemySpeed));

      // Make enemies face the player
      const angle = Math.atan2(
        this.player.mesh.position.x - enemy.position.x,
        this.player.mesh.position.z - enemy.position.z
      );
      enemy.rotation.y = angle;
    });
  }
}

export default Cats;
