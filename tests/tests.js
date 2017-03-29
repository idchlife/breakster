"use strict";

const Builder =  require("../dist/index.js").Builder;

const b = new Builder(__dirname + "/entry1.html", __dirname + "/test-actual-output").build();