<script lang="ts">
	import {onMount} from 'svelte'
	export let name: string;
	let canvas:HTMLCanvasElement;
	let ctx:CanvasRenderingContext2D;
	let video:HTMLVideoElement;
	let target:HTMLElement;
	let stepNum = 1;
	let prevData;
	let capImg;

	let threshold = 10;

	let capArray = [];

	const width = 400;
	const height= 300;

	onMount(()=>{
		let ws = new WebSocket('ws://localhost:8081');

		ws.addEventListener('open', (e) => {
			console.log('sending hi.')
			ws.send(canvas);
		});

		ws.addEventListener('message',(e)=>{
			let reader = new FileReader();

			reader.onload = () => {
				console.log('got', reader.result);
			}
			reader.readAsText(e.data)
		})

		ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		step();
	});

	function step(){
		/* 
			1) Grab the video image, 
				- it's image data Object 
				- specify the image data pixels
		*/
		ctx.drawImage(video, 0, 0, width, height, 0, 0, width, height);
		let img = ctx.getImageData(0,0,canvas.width,canvas.height);
		let data = img.data;

		// 2) Check and set previous image data.
		if(!prevData){
			prevData = data;
		}

		if(!capImg){
			capImg = data;
		}

		if(stepNum < 4){
			console.log(stepNum);
		}

		// 3) Run through image data pixels...
		for(let c = 0; c < data.length; c += 4){
			for(let col = 0; col < 3; col++){
				const color = data[c + col];

				if(color <= capImg[c+col] + threshold){
					data[c + 3] = prevData[c + 3]*.7;
					prevData[c + 3] = data[c + 3];
				}
			}
		}

		let imgd = new ImageData(data, width);
		ctx.putImageData(imgd, 0,0);

		prevData = data;
		
		setTimeout(()=>{
			stepNum++;
			requestAnimationFrame(step);
		}, 1);
	}

	function capture(){
		setTimeout(()=>{
			capImg = ctx.getImageData(0,0,canvas.width,canvas.height).data;
			requestAnimationFrame(step);
		}, 1000);
	}

	navigator.mediaDevices.getUserMedia({video: true, audio: false}).
	then((stream)=>{
		let videoTracks = stream.getTracks();
		
		video.srcObject = stream;
	}).catch((error)=>{
		console.log(error)
	})
</script>

<main>
	<canvas bind:this={canvas} />
	<div id="container">
		<!--component
		<div bind:this={target} class="target"></div>
		<!--
		{#each targetArr as target }
			<div style={"top: "+target.position[1]+"; left:" + target.position[0]} class="target">

			</div>
		{/each}
		-->

		<video autoplay bind:this={video} />
	</div>
	<a href="#" on:click={capture}>capture</a>
	<input type="range" bind:value={threshold}>
</main>

<style>
	main {
		position: relative;
	}

	.target{
		position: absolute;
		left: 100px;
		top: 100px;
		width: 100px;
		height: 100px;
	}

	canvas{
		position: absolute;
		border: 1px solid;
	}

	video{
		display: none;
		width: 400px;
		position: absolute;
		top:0px;
		left: 0px;
	}

	.target{
		background-color: #F00;
		width: 100px;
		height: 100px;
		position: absolute;
		top: 0px;
		z-index: 9999;
		left: 0px;
	}
	#container{
		width: 400px;
		height: 300px;
		position: relative;
		border:1px solid;

	}
</style>
