/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2026  Andrew Rogers
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

import * as http from 'http';
import { WebSocketServer } from 'ws';

const index = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" charset="UTF-8">
  </head>
  <body>
    <script>
let ws = new WebSocket("ws://127.0.0.1:8081");
ws.addEventListener('message', (m) => {
  console.log('message', m);
});
    </script>
  </body>
</html>`;

const hs = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
});

hs.listen(8081, 'localhost', () => {
  console.log('Server is running on', server.address());
});

const server = new WebSocketServer({server: hs});

server.on('connection', (socket) => {
    console.log('connection', socket);

    socket.on('message', (m) => {
        console.log('message: ' + m);
        socket.send('' + m);
    });

    socket.on('close', () => {
        console.log('close');
    });
});
