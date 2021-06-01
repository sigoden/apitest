const rand = {
  str(len, flag = 7) {
    const charsets = [
      "0123456789",
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ];
    let charset = "";
    if (flag & 1) {
      charset += charsets[0];
    }
    if (flag & 2) {
      charset += charsets[1];
    } 
    if (flag & 4) {
      charset += charsets[2];
    }
    let result = "";
    for (let i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charset.length);
      result += charset.substring(randomPoz, randomPoz + 1);
    }
    return result;
  },
  int(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  },
  num(min, max, percision) {
    const value = Math.random() * (max - min) + min; 
    if (percision > 1) {
      return parseFloat(value.toFixed(percision));
    }
    return value;
  },
};
