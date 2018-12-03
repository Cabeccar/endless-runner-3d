class Level {

    constructor(game) {

        this.game = game;

        this.scene = null;
        this.player = null;
        this.playerSpeed = 15;

        this.tileDepth = 10;
        this.holeDepth = 10;
        this.lastTileType = 'HOLE';
        // It is used to make hole's on the map, increment the position with the hole size
        this.currentTilePositionIncrementer = 0;

    }

    start() {
        this.createScene();
        return this;
    }

    createScene() {

        // Create the scene space
        this.scene = new BABYLON.Scene(this.game.engine);
        this.scene.enablePhysics();

        var camera = this.createArcCamera();

        // This attaches the camera to the canvas
        this.scene.activeCamera = camera;
        camera.attachControl(this.game.canvas, true);

        // Add lights to the scene
        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), this.scene);

        this.createGround();

        this.player = this.createPlayer();
        camera.target = this.player;
        camera.lockedTarget = this.player;

        this.scene.registerBeforeRender(
            this.beforeRender.bind(this)
        );

        return this.scene;

    }

    createArcCamera() {
        let camera = new BABYLON.ArcRotateCamera("arcCamera", 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
    
        camera.ctype = 1;
        camera.setPosition(new BABYLON.Vector3(0, 1, -2));
        camera.radius = 2;

        return camera;
    }

    createFollowCamera() {
        let camera = new BABYLON.FollowCamera("followCamera", new BABYLON.Vector3(0, 10, -10), this.scene);

        // The goal distance of camera from target
        camera.radius = 2;
        // The goal height of camera above local origin (centre) of target
        camera.heightOffset = 1;
        // The goal rotation of camera around local origin (centre) of target in x y plane
        // camera.rotationOffset = 180;
        camera.rotationOffset = 180;
        // Acceleration of camera in moving from current to goal position
        camera.cameraAcceleration = 0.05;
        // The speed at which acceleration is halted
        camera.maxCameraSpeed = 10;

        return camera;
    }

    createFreeCamera() {
        return new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0,
            0,-10), this.scene);
    }

    createGround() {

        // We'll use this array to determine the type of ground we will create
        let tileTypes = [
            'NORMAL_GROUND',
            'SMALL_GROUND',
            'HOLE',
            'GROUND_WITH_TOTAL_OBSTACLE',
            'GROUND_WITH_HIGH_OBSTACLE'
        ];
        
        // Let's generate the next 100 ground tiles (or holes :D)
        for(var currentTileNumber = 0; currentTileNumber < 100; currentTileNumber++) {
            
            // Choose a tyle type randomly
            let randomTileTypeNumber = Math.floor((Math.random() * tileTypes.length));
            let tyleType = tileTypes[randomTileTypeNumber];

            // Prevents generating multiple holes or tiles with obstacles in sequence
            if((this.lastTileType != 'NORMAL_GROUND') && (tyleType != 'NORMAL_GROUND')) {
                tyleType = 'NORMAL_GROUND';
            }

            this.lastTileType = tyleType;

            if(tyleType == 'NORMAL_GROUND') {
                this.createNormalGroundTile(currentTileNumber);
            }

            if(tyleType == 'SMALL_GROUND') {
                this.createSmallGroundTile(currentTileNumber);
            }

            if(tyleType == 'HOLE') {
                this.createHoleTile(currentTileNumber);
            }

            if(tyleType == 'GROUND_WITH_TOTAL_OBSTACLE') {
                this.createGroundWithObstacleTile(currentTileNumber);
            }

            if(tyleType == 'GROUND_WITH_HIGH_OBSTACLE') {
                this.createGroundWithHighObstacleTile(currentTileNumber);
            }

        }

    }

    createNormalGroundTile(currentTileNumber) {

        let tile = BABYLON.MeshBuilder.CreateBox("groundTile" + currentTileNumber, {width: 1, height: 1, depth: this.tileDepth}, this.scene);
        let tileMaterial = new BABYLON.StandardMaterial("tileMaterial", this.scene);
            
        tile.position.z = (currentTileNumber * this.tileDepth) + this.currentTilePositionIncrementer;
        tile.position.y = -0.5;

        tileMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        tile.material = tileMaterial.clone();

        tile.physicsImpostor = new BABYLON.PhysicsImpostor(tile, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        
        // Intercaling the ground color
        if((currentTileNumber % 2) == 0) {
            tile.material.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
        }

        this.currentTilePositionIncrementer = 0;

    }

    createSmallGroundTile(currentTileNumber) {

        let tile = BABYLON.MeshBuilder.CreateBox("groundTile" + currentTileNumber, {width: 0.3333, height: 1, depth: this.tileDepth}, this.scene);
        let tileMaterial = new BABYLON.StandardMaterial("tileMaterial", this.scene);
        
        // Choose the side to place the ground
        let randomSideChooser = Math.floor((Math.random() * 100) + 1);

        tile.position.x = (randomSideChooser <= 50) ? -0.3333 : 0.3333;
        tile.position.z = (currentTileNumber * this.tileDepth) + this.currentTilePositionIncrementer;
        tile.position.y = -0.5;

        tileMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        tile.material = tileMaterial.clone();

        tile.physicsImpostor = new BABYLON.PhysicsImpostor(tile, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        
        // Intercaling the ground color
        if((currentTileNumber % 2) == 0) {
            tile.material.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
        }

        this.currentTilePositionIncrementer = 0;

    }

    createHoleTile(currentTileNumber) {
        //this.currentTilePositionIncrementer = this.holeDepth;
    }

    createGroundWithObstacleTile(currentTileNumber) {

        let tile = BABYLON.MeshBuilder.CreateBox("groundTile" + currentTileNumber, {width: 1, height: 1, depth: this.tileDepth}, this.scene);
        let obstacle = BABYLON.MeshBuilder.CreateBox("obstacleTile" + currentTileNumber, {width: 1, height: 0.25, depth: 0.25}, this.scene);
        
        let tileMaterial = new BABYLON.StandardMaterial("tileMaterial", this.scene);
            
        tile.position.z = (currentTileNumber * this.tileDepth) + this.currentTilePositionIncrementer;
        tile.position.y = -0.5;

        obstacle.position.z = tile.position.z;
        obstacle.position.y = 0.125;

        tileMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        tile.material = tileMaterial.clone();

        tile.physicsImpostor = new BABYLON.PhysicsImpostor(tile, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);

        obstacle.physicsImpostor = new BABYLON.PhysicsImpostor(obstacle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        
        // Intercaling the ground color
        if((currentTileNumber % 2) == 0) {
            tile.material.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
        }

        this.currentTilePositionIncrementer = 0;

    }

    createGroundWithHighObstacleTile(currentTileNumber) {

        let tile = BABYLON.MeshBuilder.CreateBox("groundTile" + currentTileNumber, {width: 1, height: 1, depth: this.tileDepth}, this.scene);
        let obstacle = BABYLON.MeshBuilder.CreateBox("obstacleTile" + currentTileNumber, {width: 2, height: 2, depth: 0.25}, this.scene);
        
        let tileMaterial = new BABYLON.StandardMaterial("tileMaterial", this.scene);
            
        tile.position.z = (currentTileNumber * this.tileDepth) + this.currentTilePositionIncrementer;
        tile.position.y = -0.5;

        obstacle.position.z = tile.position.z;
        obstacle.position.y = 1.5;

        tileMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        tile.material = tileMaterial.clone();

        obstacle.physicsImpostor = new BABYLON.PhysicsImpostor(obstacle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this.scene);
        
        // Intercaling the ground color
        if((currentTileNumber % 2) == 0) {
            tile.material.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
        }

        this.currentTilePositionIncrementer = 0;

    }

    createPlayer() {

        let player = BABYLON.MeshBuilder.CreateBox("player", {width: 0.3333333, height: 0.5, depth: 0.3333333}, this.scene);
        player.position.y = 0.25;

        let playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
        player.material = playerMaterial;

        player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, this.scene);

        return player;

    }

    beforeRender() {
        
        let elapsedTime = (this.game.engine.getDeltaTime() / 1000);

        this.player.position.z += this.playerSpeed * elapsedTime;
        

        if(this.game.keys.up && this.player.position.y < 4) {
            this.player.position.y += (this.playerSpeed) * elapsedTime;
        } else {
            if(this.player.position.y > 0.25) {
                this.player.position.y -= (this.playerSpeed) * elapsedTime;
            }
        }

        if(this.game.keys.left) {
            this.player.position.x -= (this.playerSpeed / 3) * elapsedTime;
        }

        if(this.game.keys.right) {
            this.player.position.x += (this.playerSpeed / 3) * elapsedTime;
        }
        
        if(this.game.keys.down) {
            this.player.scaling.y = 0.5;
            this.playerSpeed = 20;
            //this.player.position.y = 0.125;
        } else {
            this.playerSpeed = 15;
            this.player.scaling.y = 1;
            //this.player.position.y = 0.25;
        }

    }
    
}