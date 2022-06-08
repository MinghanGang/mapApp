const getRandomNumber = function (min, ref) {
    return Math.floor(Math.random() * (ref - min) + min);
}

let serial_numbers = {};
for(let i = 0; i < 30; i++){
    serial_numbers[i] = 'BB' + getRandomNumber(100000, 999999);
}
export { serial_numbers };


