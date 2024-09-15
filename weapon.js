import * as THREE from "three";

class Weapon {
  constructor(scene, player, camera, ground, socket) {
    this.scene = scene;
    this.player = player;
    this.camera = camera;
    this.ground = ground;
    this.socket = socket;
    this.setupRaycaster();
    this.listenWeapon();
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

  emitWeapon(point) {
    this.socket.emit("WEAPON", {
      id: this.socket.id,
      position: this.player.mesh.position,
      point,
    });
  }

  onMouseMove(event) {
    // Update the mouse variable with the normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onMouseDown() {
    let direction = this.fire();
    this.emitWeapon(direction);
  }

  listenWeapon() {
    this.socket.on("WEAPON", (data) => {
      if (data.id === this.socket.id) return;

      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      bullet.position.copy(data.position);
      this.scene.add(bullet);

      const speed = 15;
      let userDataDirection = new THREE.Vector3();
      userDataDirection.subVectors(data.point, bullet.position).normalize();
      userDataDirection.y = 0;

      bullet.userData.direction = userDataDirection;

      const lifetime = 5000;
      setTimeout(() => {
        if (bullet) {
          this.scene.remove(bullet);
          bullet.geometry.dispose();
          bullet.material.dispose();
        }
      }, lifetime);

      const updateBullet = () => {
        if (bullet) {
          bullet.position.add(
            bullet.userData.direction.clone().multiplyScalar(speed)
          );

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

          requestAnimationFrame(updateBullet);
        }
      };

      updateBullet();
    });
  }

  fire() {
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

      const speed = 15;
      const direction = new THREE.Vector3();
      direction.subVectors(point, bullet.position).normalize();
      direction.y = 0; // Keep the bullet in the xz plane
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

      return point;
    }
  }
}

export default Weapon;
