import * as THREE from "three";

class Weapon {
  constructor(scene, player, camera) {
    this.scene = scene;
    this.player = player;
    this.camera = camera;
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

    // window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    // window.addEventListener("mousedown", this.onMouseDown.bind(this), false);
  }

  onMouseMove(event) {
    // Update the mouse variable with the normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onMouseDown(_event) {
    // Fire a laser bullet from the player to the mouse position
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

      const speed = 10;
      const direction = new THREE.Vector3();
      direction.subVectors(point, bullet.position).normalize();
      bullet.userData.direction = direction;

      // Set the bullet lifetime (in milliseconds)
      const lifetime = 5000; // 5 seconds
      setTimeout(() => {
        if (bullet) {
          this.scene.remove(bullet);
          bullet.geometry.dispose();
          bullet.material.dispose();
        }
      }, lifetime);

      // Update bullet position
      const updateBullet = () => {
        if (bullet) {
          bullet.position.add(
            bullet.userData.direction.clone().multiplyScalar(speed)
          );

          // Check boundaries (map size is 2000 units)
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

      updateBullet(); // Start updating
    }
  }
}

export default Weapon;
