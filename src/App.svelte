<script lang="ts">
	import {onMount} from 'svelte'
	import gsap from 'gsap';

	export let name: string;
	let canvas:HTMLCanvasElement;
	let ctx:CanvasRenderingContext2D;
	let video:HTMLVideoElement;
	let stepNum = 1;
	let prevData;
	let capImg;
	let vid;
	let videoPlaying = false;

	let files = [];
	let fileInput;

	let ws;
	let wsData;

	let threshold = 10;

	let capArray = [];

	const width = 400;
	const height= 300;

	let scroller;
	let commandList = [];
	let memesOpen = false;
	let mediaSource = new MediaSource();
	let sourceBuffer;

	onMount(()=>{
		vid.src = URL.createObjectURL(mediaSource);


		connect();
		scroller.style.left = window.innerWidth + 'px';

		mediaSource.addEventListener('sourceopen', ()=>{
			sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
			sourceBuffer.addEventListener('updateend', (e)=>{
				console.log(e);
				mediaSource.endOfStream();
				vid.play();
			});
		});
	});

	function openMemes(list){
		
		memesOpen = true;
		gsap.to('#memeBar', {opacity: '1', duration: 1, onComplete: ()=>{

			commandList = list;

			setTimeout(()=>{
				const scrollerWidth = parseInt(window.getComputedStyle(scroller).width);
				const width = '-' + window.innerWidth - scrollerWidth - 10;
				const containerWidth = scrollerWidth / window.innerWidth;
				scroller.style.visibility = "visible";
				scroller.style.left = (window.innerWidth - 1400) + 'px';

				gsap.fromTo('#memeScroller', {x: window.innerWidth + 'px'},{x: width, ease: "none", duration: ((14 * containerWidth)-20), onComplete:()=>{
					// console.log('completed.');
					scroller.style.visibility = "hidden";
					scroller.style.left = window.innerWidth + 'px';
					closeMemes();
				}});
			},50);		
		}});

		gsap.to('#memeBar h2', {opacity: '1', duration: 1, delay: 1.5});
		gsap.to('#memeBar h2', {opacity: '0', duration: .5, delay: 5.5});

		gsap.from('#memeBar', {left: "50%", width: '0px', padding: '0px',  duration: .5, delay:1});
		gsap.from('#memeBar', {left: "50%", width:'0px', padding: '0px', height: '10px', duration: 1});
	
	}
	
	function closeMemes(){

		memesOpen = false;
		gsap.to('#memeBar', {opacity: '0', duration: .3, delay:.2});
		// gsap.to('#memeBar', {left: "50%", width:'10px', padding: '0px', height: '0px', duration: 1});
	}

	function connect(){
		ws = new WebSocket('ws://localhost:6969');
		// wsData = 'sending';

		ws.addEventListener('open', (e) => {
			console.log('Connecting to server.')
		});

		ws.addEventListener('message',(e)=>{
		
			
			// sourceBuffer.appendBuffer(new Uint8Array(e.data));
			// vid.play();
			// console.log(e);

			const obj = JSON.parse(e.data);
			switch(obj.type){
				case 'commands':
					if(!memesOpen) openMemes(obj.list);
					break;
				case 'video':
					fileInput.value = obj.reference;
					// vid.src = obj.reference;
					// files[0] = obj.reference;
					// vid.play();
				break; 
			}

			
			// wsData = e.data;
			// vid.src = e.data;
			// vid.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
			// vid.play();
			// reader.readAsBinaryString(e.data)
			// reader.readAsText(e.data);
			// console.log(reader);
		});
	}

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

	function fileAdded(e){
		let url = URL.createObjectURL(e.srcElement.files[0]);
		console.log(url);
		// console.log(files);
		// let json = JSON.stringify(url);
		ws.send(url);
	}

	function capture(){
		setTimeout(()=>{
			capImg = ctx.getImageData(0,0,canvas.width,canvas.height).data;
			requestAnimationFrame(step);
		}, 1000);
	}

	function record(){
		navigator.mediaDevices.getUserMedia({video: true, audio: false}).
		then((stream)=>{
			let videoTracks = stream.getTracks();
			
			video.srcObject = stream;
		}).catch((error)=>{
			console.log(error)
		})
	}

	function videoPlay(url){
		
	};

	function memesDone(){
		console.log('done');
	}

	let mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
	if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
			wsData = 'supported';
			/*
			var mediaSource = new MediaSource;
			//console.log(mediaSource.readyState); // closed
			vid.src = URL.createObjectURL(mediaSource);
			mediaSource.addEventListener('sourceopen', sourceOpen);
			*/
		} else {
			console.error('Unsupported MIME type or codec: ', mimeCodec);
		}
</script>

<main>
	<input bind:this={fileInput} on:change={fileAdded} bind:value={files} type="file" />
	<video autoplay bind:this={vid}>
		<track kind="captions" />
	</video>

	<div id="memeBar">
		<div id="memeOver"></div>
		<h2>CHAT MEME COMMANDS</h2>
		<div id="memeScroller" bind:this={scroller}>
			{#each commandList as command}
				<span>!{command}</span>
			{/each}
		</div>
	</div>
</main>

<style>
	main {
		position: relative;
		height: 100%;
	}

	.target{
		position: absolute;
		left: 100px;
		top: 100px;
		width: 100px;
		height: 100px;
	}

	#memeScroller{
		position: absolute;
		left: 0px;
		}

	#memeBar{
		background-color:#000;
		position: absolute;
		bottom: 0px;
		left: 0px;
		width: 100%;
		padding: 10px;
		font-weight: bold;
		color:#FFF;
		opacity: 0;
		height: 50px;
		box-sizing: border-box;
		text-align: center;
	}
	#memeBar h2{
		opacity: 0;
		margin: 0px auto;
		position: absolute;
		left: calc(50% - 150px);
		z-index: 9999;
	}

	#memeBar span{
		margin: 0px 20px;
		font-style: italic;
		font-size: 25px;
	}
	#memeOver{
		position: absolute;
		left: 0px;
		top: 0px;
		z-index: 9998;
		box-shadow: inset -10px 25px 20px #000;
		width: 100%;
		height: 100%;
	}

	canvas{
		position: absolute;
		border: 1px solid;
	}

	video{
		/* display: none; */
		/* width: 400px; */
		/* position: absolute; */
		/* top:0px; */
		/* left: 0px; */
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
