const fs = require('fs');
const file = 'c:/Users/hp/OneDrive/Desktop/Full HACK/shanhaijing-travel/index.html';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/<!-- 中国矢量地图SVG[\s\S]*?<template id="china-map-svg-template">[\s\S]*?<\/template>/, '');
fs.writeFileSync(file, content, 'utf-8');
