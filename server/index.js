import {WebSocketServer} from 'ws';

export const wss = new WebSocketServer({
	port: 8081,
});

wss.on('connection', (ws) => {
	ws.on('message', (msg)=>{
		console.log(msg);
		ws.send(msg);
	});
});

