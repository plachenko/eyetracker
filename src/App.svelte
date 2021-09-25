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

	onMount(()=>{
		ctx = canvas.getContext('2d');
		canvas.width = 400;
		canvas.height = 300;
		step();
	});

	function step(){
		/* 
			1) Grab the video image, 
				- it's image data Object 
				- specify the image data pixels
		*/
		ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 400, 300);
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
			let dataPix = {
				r: data[c + 0],
				g: data[c + 1],
				b: data[c + 2],
				a: 255
			}

			let capPix = {
				r: capImg[c + 0],
				g: capImg[c + 1],
				b: capImg[c + 2],
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
			if(data[c + 0] <= prevData[c + 0]){
				/* data[c + 0] += Math.sin(stepNum / 2) * 300 + data[c+0];
				data[c + 1] += Math.cos(stepNum / 2) * 90;
				data[c + 2] += Math.tan(stepNum / 180) * 20; */
				data[c + 0] -= Math.sin(stepNum *.4 + prevData[c+0] / 30) * 20;
				data[c + 1] -= Math.cos(stepNum *.4 + prevData[c+2] / 100) * 200;
				data[c + 2] += Math.cos(stepNum *.9 + data[c+1] / 100) * 200;
			}else{
				data[c + 0] = 100;
				data[c+3] = 3;
			}
			/*

			if(data[c+1] >= prevData[c+1]){
				data[c + 1] = capPix.g;
			}else{
				data[c + 1] = 0;
			}

			if(data[c+2] >= prevData[c+2]){
				data[c + 2] = capPix.b;
			}else{
				data[c + 2] = 0;
			}
			*/

			//Alpha Channel.
			let thresh= 20;
			/*
			if(pix.r > thresh && pix.g > thresh && pix.b > thresh){
				data[c + 3] = pix.a;
			}else{
				data[c+3] = 100;
			}
			*/

		}

		let imgd = new ImageData(data, 80*5);
		ctx.putImageData(imgd, 0,0);

		prevData = data;

		setTimeout(()=>{
			requestAnimationFrame(step);
			stepNum++;
		}, 100);
	}

	function capture(){
		setTimeout(()=>{
			console.log('capture');
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
		z-index: 9999;
	}

	video{
		/* display: none; */
		z-index: 0;
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
