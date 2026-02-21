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

import { readFile } from 'fs';
import * as http from 'http';
import * as path from 'path'
import { WebSocketServer } from 'ws';

function url2path(url) {
  const parts = url.split('/');
  let filepath = '';
  for (let p in parts) {
    const part = parts[p];
    if (part=='.') continue;
    if (part=='..') return '';
    if (path.dirname(part) != '.') return '';
    filepath = path.join(filepath, part);
  }
  return filepath;
}

function mimeType(filepath) {
  const ext = path.extname(filepath);
  if (ext == '.html') return 'text/html';
  if (ext == '.js') return 'text/javascript';
  return 'application/octet-stream';
}

function createServer(conf) {

  const hs = http.createServer(function (req, res) {
    let url = req.url.trim().split('?')[0].split('#')[0]; // Remove query or anchor parts.
    if (url.endsWith('/')) url += 'index.html';
    const filepath = path.join(conf.root_dir, url2path(url));
    console.error('url:', url);
    console.error('path:', filepath);

    readFile(filepath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(200, {'Content-Type': mimeType(filepath)});
        res.end(data);
      }
    });
  });

  hs.listen(conf.port, conf.address, () => {
    console.error('Server is running on', server.address());
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
}

function startup() {
  const fn_conf = 'AndrewWIDE.conf';
  readFile(fn_conf, 'utf8', (err, data) => {
    let conf = null;
    if (err) console.error('Could not read configuration file:', fn_conf);
    else {
      try {
        conf = JSON.parse(data);
      } catch (error) {
        console.error(error);
      }
    }
    conf = conf || {};
    conf.port = conf.port || 8081;
    conf.address = conf.address || 'localhost';
    conf.root_dir = conf.root_dir || '.';
    conf.awdoc_dir = conf.awdoc_dir || '.';
    const server = createServer(conf);
  });
}

startup();
