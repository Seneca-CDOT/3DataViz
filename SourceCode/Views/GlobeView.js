
// View

var GlobeView = Backbone.View.extend({
  	render: function() {
  		// TODO: call 'render' from here
  		},
	initGlobe: function() {
			var scene;
			var stats;
			var renderer;
			var canvas;
			var camera;
			var container;
			var controls;

			init();
			drawGlobe();
			addCamera();
			addLight();
			addControls();
			addAxisHelper();
			render();

			function init() {
			    container = document.createElement('div');
			    document.body.appendChild(container);

			    scene = new THREE.Scene();

			    //stats; 

			    renderer = new THREE.WebGLRenderer({
			        antialias: true,
			        alpha: true
			    });

			    renderer.setPixelRatio(window.devicePixelRatio);
			    renderer.setClearColor(0x000000);
			    renderer.setSize(window.innerWidth, window.innerHeight);
			    container.appendChild(renderer.domElement);
			}

			function drawGlobe() {
			    var geometry = new THREE.SphereGeometry(50, 128, 128);

			    var texture = THREE.ImageUtils.loadTexture('Resources/Textures/Earth.jpg');
			    var specmap = THREE.ImageUtils.loadTexture('Resources/Textures/Specular.jpg');


			    var material = new THREE.MeshPhongMaterial({
			        color: 0xffffff,
			        ambient: 0xffffff,
			        map: texture,
			        specularMap: specmap,
			        shininess: 20,
			    });

			    this.globe = new THREE.Mesh(geometry, material);
			    scene.add(globe);
			}

			function render() {
			    requestAnimationFrame(render);
			    globe.rotation.y += 0.0001;
			    controls.update();

			    // if (scope.statshelp === true) stats.update();

			    renderer.render(scene, camera);
			}

			function addCamera(pos) { // adds a camera
			    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
			    camera.position.z = 100;

			    if (pos) {
			        camera.position.z = pos.z;
			        camera.position.y = pos.y;
			        camera.position.x = pos.x;
			    }
			    scene.add(camera);

			    //var help = new THREE.DirectionalLightHelper(directionalLight, 10);
			    //scene.add( help );
			}

			function onWindowResize() {
			    // windowHalfX = window.innerWidth / 2;
			    // windowHalfY = window.innerHeight / 2;

			    camera.aspect = window.innerWidth / window.innerHeight;
			    camera.updateProjectionMatrix();
			    renderer.setSize(window.innerWidth, window.innerHeight);
			}

			window.addEventListener('resize', onWindowResize, false);

			function addLight() {
			    var ambLight = new THREE.AmbientLight(0xFFFFFF);
			    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
			    dirLight.position.set( 100,100,100 );
			    dirLight.target = globe;

			    //scene.add(ambLight);
			    camera.add(dirLight);
			}

			function addControls() {
			    controls = new THREE.OrbitControls(camera, canvas);
			    controls.minDistance = 75;
			    controls.maxDistance = 150;
			    controls.userPan = false;
			}

			function addAxisHelper() {
			    //if (scope.axishelp === false) return;

			    var axes = new THREE.AxisHelper(200);
			    axes.position.set(0, 0, 0);
			    globe.add(axes);
			}
		},
		addSpikes: function (data) {
			data.each(function(dataRecord) {
				var height = dataRecord.get("population") / 500000;

			    var geometry = new THREE.CylinderGeometry(0.2, 0.2, height, 32);
			    var material = new THREE.MeshPhongMaterial({
			        ambient: 0x00ff00,
			        color: 0x00ff00,
			    });
			    var spike = new THREE.Mesh(geometry, material);
			    globe.add(spike);
			    
			    var phi = dataRecord.get("latitude") * Math.PI / 180;
			    var theta = (dataRecord.get("longitude") + 90) * Math.PI / 180;
			    var radius = 50;

			    var x = radius * Math.cos(phi) * Math.sin(theta);
			    var y = radius * Math.sin(phi);
			    var z = radius * Math.cos(phi) * Math.cos(theta);

			    var vec = new THREE.Vector3(x, y, z);
			    spike.position.copy(vec);
			    spike.rotation.y = dataRecord.get("longitude") * Math.PI / 180;

			    var xRotationSign = dataRecord.get("longitude") + 90 > 90 ? -1 : 1;
			    spike.rotation.x = xRotationSign * (90 - dataRecord.get("latitude")) * Math.PI / 180;
			}); 
		},
		showGlobe: function(data) {
			this.initGlobe();
			this.addSpikes(data);
		}
});
