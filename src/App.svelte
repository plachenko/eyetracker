<script lang="ts">
	import {onMount} from 'svelte'
	export let name: string;
	let canvas:HTMLCanvasElement;
	let ctx:CanvasRenderingContext2D;
	let video:HTMLVideoElement;
	let target:HTMLElement;

	onMount(()=>{
		ctx = canvas.getContext('2d');
		canvas.width = 400;
		canvas.height = 300;
		requestAnimationFrame(step);
	});

	function step(){
		ctx.drawImage(video, 140, 100, video.videoWidth, video.videoHeight, 0, 0, 3000, 3000);
		requestAnimationFrame(step);
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
		<div bind:this={target} class="target"></div>
		<!--
		{#each targetArr as target }
			<div style={"top: "+target.position[1]+"; left:" + target.position[0]} class="target">

			</div>
		{/each}
		-->

		<video autoplay bind:this={video} />
	</div>
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
		top: 310px;
		left: px;
		border: 1px solid;
	}

	video{
		width: 400px;
		position: absolute;
		top:0px;
		left: 0px;
	}

	.target{
		color:#F00;
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
