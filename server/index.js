import {WebSocketServer} from 'ws';

export const wss = new WebSocketServer({
	port: 6969,
});

console.log(`running server on port ${wss.address().port}`)

wss.on('connection', (ws) => {
	console.log('connected');
	// console.log(ws);
	ws.on('message', (msg)=>{
		ws.send(msg);
		wss.clients.forEach((e)=>{
			// e.send(msg);
		})
		// console.log(msg);
	});
});

