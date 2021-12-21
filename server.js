const http = require("http");
const fs = require("fs");

const typeMap = {
	"": "text/plain",

	".html": "text/html",
	".css": "text/css",
	".js": "text/javascript",
	".mjs": "application/javascript",

	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".bmp": "imae/bitmap",
	".ico": "image/x-icon",
	".svg": "image/svg+xml"
};


function request(req, res) {
	if(!req.url.includes('.')) {
		if(req.url.slice(-1) !== '/') req.url += '/';
		req.url += "index.html";
	}

	let type = req.url.slice(req.url.lastIndexOf('.'));
	type = typeMap[type];
	if(!type) type = typeMap[""];

	fs.readFile("./src" + req.url, (err, data) => {
		if(err) {
			res.writeHead(404);
			res.end("404 Not Found");
			return;
		}

		res.writeHead(200, { "Content-Type": type });
		res.end(data);
	});
}


const hostInfo = {
	ip: "127.0.0.1",
	port: 8080
};

const server = http.createServer(request);
server.listen(hostInfo.port, hostInfo.ip);

console.log("Hosting at", hostInfo.ip + ':' + hostInfo.port);
