const animationContainer = document.getElementById('groupchat-img');
const animData = {
	container: animationContainer,
	renderer: 'svg',
	loop: true,
	autoplay: true,
	path: './images/Creative Team.json' // Path to your Lottie JSON file
};
const anim = lottie.loadAnimation(animData);

const animationContainer1 = document.getElementById('customer-service-img');
const animData1 = {
	container: animationContainer1,
	renderer: 'svg',
	loop: true,
	autoplay: true,
	path: './images/call-center.json' // Path to your Lottie JSON file
};
const anim1 = lottie.loadAnimation(animData1);

console.log(gsap);

// gsap
gsap.from(".siteName", {
	x: -200,
	duration: 1,
},0.1)

gsap.from(".navlinks", {
	opacity: 0,
	y: 50,
	duration: 1,
})

gsap.from("#login", {
	x: 200,
	duration: 1
})

gsap.from(".heading-home", {
	opacity: 0,
	x:-50,
	duration: 1,
	delay: 1.2
})

gsap.from(".desc-home", {
	opacity: 0,
	x: -50,
	duration: 1,
	delay: 1.5
})

gsap.from(".chatting-img", {
	opacity: 0,
	x: 50,
	duration: 1,
	delay: 1.3
})