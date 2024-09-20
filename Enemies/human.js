import * as THREE from "three";

class Humans {
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

  // Create enemy human models
  createCat() {
    const humanGroup = new THREE.Group(); // Group to hold all parts of the human

    // Human Body
    const bodyGeometry = new THREE.BoxGeometry(20, 10, 10);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 5, 0); // Raise body above ground

    // Human Head
    const headGeometry = new THREE.BoxGeometry(8, 8, 8);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xedcbbd });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 20, 0); // Position head in front of body

    // Human Legs (2 legs)
    const legGeometry = new THREE.BoxGeometry(3, 5, 3);
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0xedcbbd });
    const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontLeftLeg.position.set(-5, 2.5, 5);

    const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
    frontRightLeg.position.set(5, 2.5, 5);

    // Human Arms (2 arms)

    const armGeometry = new THREE.BoxGeometry(3, 5, 8);
    const armMaterial = new THREE.MeshBasicMaterial({ color: 0xedcbbd });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-10, 5.5, 5);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(10, 5.5, 5);

    // Crown of the hat (top part)
    const hatCrownGeometry = new THREE.CylinderGeometry(4, 4, 5, 32); // Rounder crown
    const hatCrownMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hatCrown = new THREE.Mesh(hatCrownGeometry, hatCrownMaterial);
    hatCrown.position.set(0, 27, 1);

    // Brim of the hat (lip part)
    const hatBrimGeometry = new THREE.CylinderGeometry(6, 6, 1, 32); // Wider and flatter for the brim
    const hatBrimMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hatBrim = new THREE.Mesh(hatBrimGeometry, hatBrimMaterial);
    hatBrim.position.set(0, 25, 1); // Slightly below the crown

    // Add both the crown and brim to the scene or to a group
    const hat = new THREE.Group();
    hat.add(hatCrown);
    hat.add(hatBrim);

    // Add all parts to the cat group
    humanGroup.add(body);
    humanGroup.add(head);
    humanGroup.add(frontLeftLeg);
    humanGroup.add(frontRightLeg);
    humanGroup.add(leftArm);
    humanGroup.add(rightArm);
    humanGroup.add(hat);

    // Position the entire cat randomly on the ground
    humanGroup.position.set(
      Math.random() * 2000 - 1000,
      5,
      Math.random() * 2000 - 1000
    );

    return humanGroup;
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

export default Humans;
