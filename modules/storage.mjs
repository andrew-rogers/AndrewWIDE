/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2024  Andrew Rogers
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

let aw = null;

export function init(a) {
  aw = a;
  aw.storage = new Storage('AndrewWIDE Storage');
}

class Storage {
  constructor(db_name) {
    this.db_name = db_name;
    this.db = null;
  }

  lsDB() {
    return indexedDB.databases();
  }

  // https://nodejs.org/api/fs.html#fsreaddirpath-options-callback
  readdir(path, options, callback) {
    if (typeof callback === 'undefined') callback = options;
    let suspend_id = aw.suspend('Reading directory: ' + path);
    if(path && !path.endsWith('/')) path = path + '/';
    let files = [];
    let that = this;
    that.#openDB(function() {
      if (that.db) {
        const os = that.db.transaction('files','readonly').objectStore('files');
        const req = os.openCursor();

        req.onsuccess = (event) => {
          const cursor = event.target.result;
          if (!cursor) {
            callback(null, files);
            aw.resume(suspend_id);
          }
          else {
            let cpath = cursor.value.path;
            if (cpath.startsWith(path)) {
              let fn = cpath.slice(path.length);
              // TODO: Don't include files in subdirectories.
              files.push(fn);
            }

            cursor.continue();
          }
        };

        req.onerror = (event) => {
          callback('error',files);
          aw.resume(suspend_id);
        };
      }
      else {
        callback('error', null);
        aw.resume(suspend_id);
      }
    });
  }

  // https://nodejs.org/api/fs.html#fsreadfilepath-options-callback
  readFile(path, options, callback) {
    if (typeof callback === 'undefined') callback = options;
    let suspend_id = aw.suspend('Reading file: ' + path);
    let that = this;
    that.#openDB(function() {
      if (that.db) {
        that.#getFileObj(path, (obj) => {
          if (typeof obj === 'string') {
            callback('obj', null);
            aw.resume(suspend_id);
          }
          else {
            callback(null, obj.content);
            aw.resume(suspend_id);
          }
        });
      }
      else {
        callback('error', null);
        aw.resume(suspend_id);
      }  
    });
  }

  // https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback
  writeFile(file, data, options, callback) {
    if (typeof callback === 'undefined') callback = options;
    let suspend_id = aw.suspend('Writing file: ' + file);
    let that = this;
    that.#openDB(function() {
      if (that.db) {
        const os = that.db.transaction('files','readwrite').objectStore('files');
        let obj = {};
        obj.content = data;
        obj.path = file;

        const key = obj.path;
        const req = os.put(obj, key);

        req.onsuccess = (event) => {
          callback('success');
          aw.resume(suspend_id);
        };

        req.onerror = (event) => {
          callback('error');
          aw.resume(suspend_id);
        };
      }
      else {
        callback('error');
        aw.resume(suspend_id);
      }
    });
  }

  #getFileObj(path, callback) {
    const os = this.db.transaction('files','readwrite').objectStore('files');
    const req = os.openCursor();

    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) {
        callback('File not found: ' + path);
      }
      else {
        if (cursor.value.path == path) {
          callback(cursor.value);
        }
        else {
          cursor.continue();
        }
      }
    };

    req.onerror = (event) => {
      callback('error');
    };
  }

  #openDB(callback) {
    if (this.db) {
      if (callback) callback();
    }
    else {
      var request = indexedDB.open(this.db_name);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('cache');
        db.createObjectStore('files');
        db.createObjectStore('settings');
        db.createObjectStore('scripts');
      };

      request.onerror = (event) => {
        console.log("Error openning DB: " + this.db_name);
        if (callback) callback();
      };

      request.onsuccess = (event) => {
        this.db = request.result;
        if (callback) callback();
      };
    }
  }
}