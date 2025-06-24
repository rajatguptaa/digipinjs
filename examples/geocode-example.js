// examples/geocode-example.js

const {
  reverseGeocode,
  getDistance,
  getPreciseDistance,
  orderByDistance,
  findNearest,
} = require('digipinjs');

const delhi = '39J-438-TJC7';
const mumbai = '4FK-595-8823';

const location = reverseGeocode(delhi);
console.log(`DigiPIN ${delhi} ->`, location);

console.log('Distance Delhi-Mumbai:', getDistance(delhi, mumbai));
console.log('Precise distance:', getPreciseDistance(delhi, mumbai));

const pins = [mumbai, '2L7-3K9-8P2F']; // Mumbai, Bangalore
console.log('Sorted pins:', orderByDistance(delhi, pins));
console.log('Nearest pin:', findNearest(delhi, pins));
