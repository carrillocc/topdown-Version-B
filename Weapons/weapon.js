import * as THREE from "three";

class Weapon {
  constructor(scene, player, camera, ground, enemies) {
    // Pass enemies to the weapon
    this.scene = scene;
    this.player = player;
    this.camera = camera;
    this.ground = ground;
    this.enemies = enemies; // Store the enemies reference
    this.setupRaycaster();
  }

  setupRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.laserGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    this.laser = new THREE.Line(this.laserGeometry, this.laserMaterial);
    this.scene.add(this.laser);
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.ground);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const direction = new THREE.Vector3();
      direction.subVectors(point, this.player.mesh.position).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      this.player.mesh.rotation.y = angle;
    }
  }

  onMouseDown(_event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.ground);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      bullet.position.copy(this.player.mesh.position);
      this.scene.add(bullet);

      const speed = 15;
      const direction = new THREE.Vector3();
      direction.subVectors(point, bullet.position).normalize();
      direction.y = 0; // Keep the bullet in the xz plane
      bullet.userData.direction = direction;

      const bulletLifetime = 5000; // Bullet lifetime
      setTimeout(() => {
        if (bullet) {
          this.scene.remove(bullet);
          bullet.geometry.dispose();
          bullet.material.dispose();
        }
      }, bulletLifetime);

      // Update bullet position and detect collisions
      const updateBullet = () => {
        if (bullet) {
          bullet.position.add(
            bullet.userData.direction.clone().multiplyScalar(speed)
          );

          // Check collision with each enemy
          this.enemies.enemies.forEach((enemy, index) => {
            const enemyBox = new THREE.Box3().setFromObject(enemy);
            const bulletBox = new THREE.Box3().setFromObject(bullet);

            // If the bullet intersects with the enemy, remove both
            if (bulletBox.intersectsBox(enemyBox)) {
              console.log("Hit detected!");
              this.scene.remove(bullet);
              this.scene.remove(enemy);

              // Clean up enemy and bullet resources
              bullet.geometry.dispose();
              bullet.material.dispose();
              this.enemies.enemies.splice(index, 1); // Remove enemy from array

              return;
            }
          });

          // Check if bullet is out of bounds
          if (
            bullet.position.x > 10000 ||
            bullet.position.x < -10000 ||
            bullet.position.z > 10000 ||
            bullet.position.z < -10000
          ) {
            this.scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();
            return;
          }

          requestAnimationFrame(updateBullet); // Continue updating
        }
      };

      updateBullet(); // Start updating bullet position
    }
  }

  checkBulletCollisions(bullet) {
    // Check if the bullet intersects any enemies
    this.enemies.enemies.forEach((enemy, index) => {
      const distance = bullet.position.distanceTo(enemy.position);
      if (distance < 10) {
        // Collision threshold (adjust as needed)
        // Enemy hit, blow it up!
        this.blowUpEnemy(enemy, index);
        this.scene.remove(bullet); // Remove bullet on collision
        bullet.geometry.dispose();
        bullet.material.dispose();
      }
    });
  }

  blowUpEnemy(enemy, index) {
    // Create an explosion effect (basic scaling animation for now)
    const explosion = new THREE.Mesh(
      new THREE.SphereGeometry(30, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    explosion.position.copy(enemy.position);
    this.scene.add(explosion);

    // Remove enemy from the scene
    this.scene.remove(enemy);
    this.enemies.enemies.splice(index, 1);

    // Remove explosion after a short time
    setTimeout(() => {
      this.scene.remove(explosion);
      explosion.geometry.dispose();
      explosion.material.dispose();
    }, 500); // Explosion lasts 0.5 seconds
  }
}

export default Weapon;
