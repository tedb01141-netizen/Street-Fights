// --- 1. INITIALIZE THREE.JS SCENE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2.5, 5); // Perfect side-view height and distance

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup (Kept bright so her textures look great)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- 2. CREATE STAGE ---
const stageGeo = new THREE.BoxGeometry(16, 0.5, 4);
const stageMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const stage = new THREE.Mesh(stageGeo, stageMat);
stage.position.y = -0.25;
scene.add(stage);

// --- 3. CREATE FIGHTERS ---

// Create an empty group to act as Player 1's anchor point
const player1 = new THREE.Group();
player1.position.set(-2, 0, 0); 
scene.add(player1);

// Initialize the GLTF Loader to read your files
const loader = new THREE.GLTFLoader();

loader.load(
    'scene.gltf', 
    function (gltf) {
        const model = gltf.scene;
        
        // Scale down by roughly 65x so an FBX-converted model fits the stage
        model.scale.set(0.015, 0.015, 0.015); 
        
        // Face toward Player 2 on the right side
        model.rotation.y = Math.PI / 2; 
        
        // Add her directly to the Player 1 control group
        player1.add(model);
        console.log("Chun-Li successfully loaded into the game tier!");
    },
    undefined,
    function (error) {
        console.error("Model loading breakdown:", error);
    }
);

// Player 2 / Target Dummy (Kept as the red box for fighting mechanics practice)
const enemyGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
const enemyMat = new THREE.MeshStandardMaterial({ color: 0xe84118 });
const player2 = new THREE.Mesh(enemyGeo, enemyMat);
player2.position.set(2, 0.9, 0);
scene.add(player2);

// --- 4. GAME STATE ---
let p1Health = 100;
let p2Health = 100;
let p1VelocityX = 0;
const speed = 0.08;

// --- 5. CONTROLS ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') p1VelocityX = -speed;
    if (e.key === 'ArrowRight' || e.key === 'd') p1VelocityX = speed;
    if (e.key === 'f' || e.key === ' ') attack();
});
window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) p1VelocityX = 0;
});

document.getElementById('btn-left').addEventListener('touchstart', () => p1VelocityX = -speed);
document.getElementById('btn-left').addEventListener('touchend', () => p1VelocityX = 0);
document.getElementById('btn-right').addEventListener('touchstart', () => p1VelocityX = speed);
document.getElementById('btn-right').addEventListener('touchend', () => p1VelocityX = 0);
document.getElementById('btn-attack').addEventListener('touchstart', attack);

// --- 6. COMBAT LOGIC ---
function attack() {
    // Quick forward lunge step
    player1.position.x += 0.3 * Math.sign(player2.position.x - player1.position.x);
    
    const distance = player1.position.distanceTo(player2.position);
    if (distance < 1.4) {
        p2Health -= 10;
        if (p2Health < 0) p2Health = 0;
        document.getElementById('p2-health').style.width = p2Health + '%';
        player2.position.x += 0.4; // Apply knockback
        if (p2Health === 0) alert("Player 1 Wins!");
    }
    
    // Recovery frame step back
    setTimeout(() => { 
        player1.position.x -= 0.2 * Math.sign(player2.position.x - player1.position.x); 
    }, 100);
}

// --- 7. MAIN GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    player1.position.x += p1VelocityX;
    player1.position.x = Math.max(-7.5, Math.min(7.5, player1.position.x));
    
    // Smooth dynamic camera tracking between fighters
    camera.position.x = (player1.position.x + player2.position.x) / 2;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
