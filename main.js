import * as THREE from "three";
import UFO from "./Players/ufo.js";
import Bird from "./Players/bird.js";
import Weapon from "./weapon.js";
import io from "socket.io-client";
import Cats from "./Enemies/cat.js";
import Humans from "./Enemies/human.js";

class Game {
  constructor() {
    this.connectSocket();
    this.initScene();
    this.playerHeight = 250;
    this.playerType = this.choosePlayerType(); // Prompt player type
    this.enemyType = this.chooseEnemyType();
    this.initPlayer();
    this.initWeapon();
    this.initEnemies();
    this.playerDistance = 75;

    this.members = [];

    // Bind the player's keydown and keyup methods to ensure correct context
    this.addEventListeners = this.addEventListeners.bind(this);
    this.animate = this.animate.bind(this);

    this.addEventListeners();
    this.animate();
  }

  choosePlayerType() {
    const playerType = prompt("Choose your player type: 'ufo' or 'bird'");
    if (playerType !== "ufo" && playerType !== "bird") {
      alert("Invalid choice. Defaulting to 'bird'.");
      return "bird";
    }
    return playerType;
  }

  chooseEnemyType() {
    const enemyType = prompt("Choose your enemy type: 'cats' or 'humans");
    if (enemyType !== "cats" && enemyType !== "humans") {
      alert("Invalid choice. Defaulting to 'cats'");
      return "cats";
    }
    return enemyType;
  }

  initPlayer() {
    if (this.playerType === "ufo") {
      this.player = new UFO(this.scene, this.socket); // UFO player
    } else {
      this.player = new Bird(this.scene, this.socket); // Bird player
    }
    this.scene.add(this.player.mesh);
  }

  initEnemies() {
    if (this.enemyType === "cats") {
      this.enemies = new Cats(this.scene, this.player);
    } else {
      this.enemies = new Humans(this.scene, this.player);
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
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
    this.scene.add(this.ground);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 200, 100);
    this.scene.add(directionalLight);

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  initWeapon() {
    this.weapon = new Weapon(
      this.scene,
      this.player,
      this.camera,
      this.ground,
      this.socket
    );
  }

  connectSocket() {
    this.socket = io("http://localhost:3000");
    this.socket.on("connect", () => {
      console.log("Connected:", this.socket.id);
      this.joinRoom();
      this.watchMembers();
    });

    this.socket.on("POSITION", (data) => {
      const member = this.members.find((member) => member.id === data.id);
      if (member) {
        member.player.mesh.position.set(
          data.position.x,
          data.position.y,
          data.position.z
        );
      }
    });

    this.socket.on("disconnect", () => {
      this.socket.emit("LEAVE", { id: this.socket.id });
    });
  }

  joinRoom() {
    this.socket.emit("JOIN", {
      member: {
        id: this.socket.id,
        name: "PlayerX", // Consider getting the actual player name dynamically
        position: this.player.mesh.position,
        type: this.playerType, // Include player type (ufo or bird)
      },
    });
    this.watchJoin();
    this.watchLeave();
  }

  watchJoin() {
    this.socket.on("JOIN", (data) => {
      console.log("JOIN event received:", data);

      let player;
      if (data.member.type === "ufo") {
        player = new UFO(this.scene, this.socket, data.member);
      } else {
        player = new Bird(this.scene);
      }

      this.members = [...this.members, { id: data.member.id, player }];
      this.scene.add(player.mesh);

      console.log("MEMBERS:", this.members);
    });
  }

  watchMembers() {
    this.socket.on("MEMBERS", (data) => {
      this.members = data.map((datumn) => {
        let player;
        if (datumn.member.type === "ufo") {
          player = new UFO(this.scene, this.socket, datumn.member);
        } else {
          player = new Bird(this.scene);
        }

        this.scene.add(player.mesh);
        return { id: datumn.member.id, player };
      });
    });
  }

  watchLeave() {
    this.socket.on("LEAVE", (data) => {
      const leavingPlayer = this.members.find(
        (member) => member.id === data.id
      );
      if (leavingPlayer) {
        this.scene.remove(leavingPlayer.player.mesh);
      }
      this.members = this.members.filter((member) => member.id !== data.id);
    });
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

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  addEventListeners() {
    // Bind the player's keydown and keyup functions to ensure correct 'this'
    document.addEventListener("keydown", (event) => {
      if (this.player && typeof this.player.onKeyDown === "function") {
        this.player.onKeyDown(event);
      }
    });

    document.addEventListener("keyup", (event) => {
      if (this.player && typeof this.player.onKeyUp === "function") {
        this.player.onKeyUp(event);
      }
    });

    // Bind for other event listeners like 'mousedown' or 'mousemove' for the weapon
    document.addEventListener(
      "mousedown",
      this.weapon.onMouseDown.bind(this.weapon)
    );
    document.addEventListener(
      "mousemove",
      this.weapon.onMouseMove.bind(this.weapon)
    );
  }
}

new Game();
