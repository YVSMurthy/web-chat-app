const animationContainer = document.getElementById("login-right");
const animData = {
	container: animationContainer,
	renderer: 'svg',
	loop: true,
	autoplay: true,
	path: './images/login.json' // Path to your Lottie JSON file
};
const anim = lottie.loadAnimation(animData);

const animationContainer1 = document.getElementById("signup-left");
const animData1 = {
	container: animationContainer1,
	renderer: 'svg',
	loop: true,
	autoplay: true,
	path: './images/signup.json' // Path to your Lottie JSON file
};
const anim1 = lottie.loadAnimation(animData1);