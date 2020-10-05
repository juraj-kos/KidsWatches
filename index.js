var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
let camera, spotLight, shadowGenerator, cameraTracker;

var colorValues = [
	"#f4f4f4",
	"#f3dce4",
	"#f43642",
	"#92ff53",
	"#29a833",
	"#35c3fc",
	"#1366b3",
	"#363636",
];

var materialValues = [
	{
		name: "Bezel",
		albedoColor: "#e33c46",
		roughness: 0.5,
	},
	{
		name: "StrapInner",
		albedoColor: "#f43642",
		roughness: 0.8,
	},
	{
		name: "StrapOuter",
		albedoColor: "#120c10",
		roughness: 0.8,
	},
	{
		name: "BezelLetters",
		albedoColor: "#f3dce4",
		roughness: 0.4,
	},
	{
		name: "FaceLetters",
		albedoColor: "#df0818",
		roughness: 0.8,
	},
	{
		name: "FaceBack",
		albedoColor: "#f4f4f4",
		roughness: 0.8,
	},
	{
		name: "HourHand",
		albedoColor: "#000000",
		roughness: 0.8,
	},
	{
		name: "MinuteHand",
		albedoColor: "#00000",
		roughness: 0.8,
	},
	{
		name: "SecondHand",
		albedoColor: "#c5b4ad",
		roughness: 0.8,
	},
	{
		name: "HourTicks",
		albedoColor: "#a62c39",
		roughness: 0.8,
	},
	{
		name: "MinuteTicks",
		albedoColor: "#474143",
		roughness: 0.8,
	},
];

var containerLeft = document.getElementById("container-left");
for (let index = 0; index < containerLeft.children.length; index++) {
	const div = containerLeft.children[index];
	if (div.classList.contains("color-buttons")) {
		for (let index = 0; index < div.children.length; index++) {
			const child = div.children[index];
			child.addEventListener("click", (e) => {
				var parentID = div.id;
				colorButtonClicked(parentID, index);
			});
		}
	}
}

function colorButtonClicked(name, index) {
	var newColorValue = colorValues[index];
	materialValues.forEach((matValue) => {
		if (matValue.name === name) {
			matValue.albedoColor = newColorValue;
			matValue.material.albedoColor = new BABYLON.Color3.FromHexString(
				newColorValue
			);
		}
	});
}

var createScene = function () {
	var scene = new BABYLON.Scene(engine);

	var env256 = BABYLON.CubeTexture.CreateFromPrefilteredData(
		"playground.env",
		scene
	);
	env256.name = "playground_256";
	env256.gammaSpace = false;
	scene.environmentTexture = env256;

	scene.createDefaultSkybox(env256, true, 1000);

	materialValues.forEach((matValue) => {
		var material = new BABYLON.PBRMaterial(matValue.name, scene);
		material.albedoColor = new BABYLON.Color3.FromHexString(
			matValue.albedoColor
		);
		material.roughness = matValue.roughness;
		material.metallic = 0;
		matValue.material = material;
	});

	camera = new BABYLON.ArcRotateCamera(
		"Camera",
		Math.PI / 2,
		Math.PI / 2,
		2,
		new BABYLON.Vector3(0, 0, 0),
		scene
	);
	camera.attachControl(canvas, true);
	camera.inputs.attached.pointers.buttons = [0];
	camera.lowerRadiusLimit = 3;
	camera.upperRadiusLimit = 9;
	camera.wheelPrecision = 50;

	var hemiLight = new BABYLON.HemisphericLight(
		"HemiLight",
		new BABYLON.Vector3(0, 1, 0),
		scene
	);
	hemiLight.diffuse = new BABYLON.Color3.FromHexString("#fffae6");
	hemiLight.specular = new BABYLON.Color3.FromHexString("#ffffff");
	hemiLight.groundColor = new BABYLON.Color3.FromHexString("#484668");
	hemiLight.intensity = 0.5;

	spotLight = new BABYLON.SpotLight(
		"SpotLight",
		new BABYLON.Vector3(-2, 2, 2),
		new BABYLON.Vector3(0.017, -0.019, -0.025),
		1.5708,
		0,
		scene
	);
	spotLight.intensity = 20;
	spotLight.shadowEnabled = true;
	spotLight.shadowMinZ = 0.001;
	spotLight.shadowMaxZ = 10;

	console.log(camera.position);
	console.log(spotLight.position);

	shadowGenerator = new BABYLON.ShadowGenerator(2048, spotLight, true);
	shadowGenerator.bias = 0.001;
	shadowGenerator.normalBias = 0.005;
	shadowGenerator.filter = 2;
	shadowGenerator.transparencyShadow = true;

	loadObjects();

	return scene;
};

function loadObjects() {
	BABYLON.SceneLoader.ImportMesh("", "", "MickeyWatch.gltf", scene, function (
		meshes,
		_pS,
		_s
	) {
		meshes.forEach((mesh) => {
			if (mesh.name === "__root__") {
				mesh.rotation = new BABYLON.Vector3(-1.5708, 3.14159, 0);
			}
			materialValues.forEach((matValue) => {
				if (mesh.name === matValue.name) {
					mesh.material = matValue.material;
				}
			});
			shadowGenerator.addShadowCaster(mesh);
			mesh.receiveShadows = true;
		});
	});
}

var scene = createScene();

engine.runRenderLoop(function () {
	scene.render();

	// spotLight.lookAt(new BABYLON.Vector3(0, 0, 0));

	// console.log(camera.position);
});
