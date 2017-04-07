"use strict";

import test from 'ava';
const del = require('del');
const fs = require('async-file');
const Builder =  require('../dist/index.js').Builder;

test.before(async t => {
  await del(
    [
      './test-actual-output/*',
      '!./test-actual-output/.gitignore',
      '!./test-actual-output/.gitkeep'
    ]
  );
});

test(async t => {
  const b = new Builder(
    __dirname + '/entry1.html',
    __dirname + '/test-actual-output'
  );

  console.log('starting build');
  await b.build();
  console.log('finishind build');

  t.pass();

  const filesToBeThere = [
    'BuyButton.tsx',
    'IndexPage.tsx',
    'Layout.tsx',
    'Product.tsx',
    'Table.tsx',
    'TableRow.tsx',
    'UserInfo.tsx'
  ];

  let fileNotThere = false;

  filesToBeThere.forEach(async name => {
    const filePath = __dirname + `/../test-actual-output/${name}`;
    const isThere = await fs.exists(filePath);

    if (!isThere) {
      fileNotThere = true;
    }
  });

  t.false(fileNotThere);
});