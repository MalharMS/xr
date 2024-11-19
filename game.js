let currentAnswer = 0;
let score = 0;
const video = document.getElementById('videoElement');
const result = document.getElementById('result');
const questionDiv = document.getElementById('questionDiv');
const scoreDiv = document.getElementById('score');

// Generate a math question
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    currentAnswer = num1 + num2;
    questionDiv.textContent = `What is ${num1} + ${num2}?`;
}

// Count extended fingers from landmarks
function countFingers(predictions) {
    if (!predictions.length) return 0;
    
    const landmarks = predictions[0].landmarks;
    let count = 0;
    
    // Define finger bases (MCP joints)
    const bases = [5, 9, 13, 17];  // Index, Middle, Ring, Pinky
    const tips = [8, 12, 16, 20];  // Corresponding fingertips
    
    // Check each finger
    for (let i = 0; i < bases.length; i++) {
        const base = landmarks[bases[i]];
        const tip = landmarks[tips[i]];
        
        // If fingertip is higher than base, finger is extended
        if (tip[1] < base[1]) {
            count++;
        }
    }
    
    // Check thumb separately
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];
    if (thumbTip[0] < thumbBase[0]) {
        count++;
    }
    
    return count;
}

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function init() {
    await setupCamera();
    const model = await handpose.load();
    generateQuestion();

    async function detect() {
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            const fingerCount = countFingers(predictions);
            
            if (fingerCount === currentAnswer) {
                result.textContent = `Correct! You showed ${fingerCount} fingers!`;
                result.className = 'result correct';
                score += 10;
                scoreDiv.textContent = `Score: ${score}`;
                setTimeout(generateQuestion, 1000);
            } else {
                result.textContent = `You're showing ${fingerCount} fingers. Keep trying!`;
                result.className = 'result incorrect';
            }
        }
        requestAnimationFrame(detect);
    }
    
    detect();
}

// Start the game
init();