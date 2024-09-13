import * as THREE from "three";

class Enemies {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.enemies = [];
    this.enemySpeed = 0.5; // Enemy Speed

    this.spawnEnemies(5); // Spawn 5 enemies
  }

  // Create enemy cat models
  createCat() {
    const catGeometry = new THREE.BoxGeometry(20, 10, 20); // Cat Body TODO: Make cat look more like a cat lol
    const catMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 }); // Cat Color
    const cat = new THREE.Mesh(catGeometry, catMaterial);

    cat.position.set(
      Math.random() * 2000 - 1000, // Random X position
      5, // Y position (above the ground to make sure they are above the plane)
      Math.random() * 2000 - 1000 // Random Z position
    );

    return cat;
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

export default Enemies;
