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

	const width = 400;
	const height= 300;

	onMount(()=>{
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

		// 3) Run through image data pixels...
		for(let c = 0; c < data.length; c += 4){
			let pix = {
				r: data[c + 0] - capImg[c + 0],
				g: data[c + 1] - capImg[c + 1],
				b: data[c + 2] + capImg[c + 2],
				a: 255
			}

			/*
			if(data[c+0] <= capImg.data[c+0]-10 && data[c+0]>=capImg.data[c+0]+10){
				data[c + 0] = 125;
			}else{
				data[c + 0] = data[c + 0];
			}

			if(data[c+1] == capImg.data[c+1]){
				data[c + 1] = 20;
			}else{
				data[c + 1] = data[c+1];
			}
			*/

			//Red Channel.
			if(data[c+0] >= prevData[c+0]){
				data[c + 0] = pix.r;
			}else{
				data[c + 0] = pix.b /2;
			}

			//Green Channel.
			if(data[c+1] >= prevData[c+1]){
				data[c + 1] = pix.g;
			}else{
				data[c + 1] = pix.r/100;
			}

			//Blue Channel.
			if(data[c+2] >= prevData[c+2]){
				data[c + 2] = pix.b;
			}else{
				data[c + 2] = pix.b/40;
			}

			if(data[c+0] >= 20){
				/* data[c+0] = 100; */

			}

			//Alpha Channel.
			let thresh= 10;
			if(capImg[c+1] <= prevData[c+1]-thresh && data[c+1] >= prevData[c+1]+thresh){
				data[c + 3] -= 250;
			}else{
				data[c+3] = 250;
			}

			data[c+3] = 150 - data[c+3];

			if(prevData[c+0] >= 50){
				prevData[c+3] = 0;
			}
		}


		let imgd = new ImageData(data, width);
		ctx.putImageData(imgd, 0,0);

		prevData = data;

		setTimeout(()=>{
			requestAnimationFrame(step);
		}, 0);
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
