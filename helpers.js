export const helpers = {
  zeroPadder: function (yourNumber, minLength=2) {
    // get the minimum length of the result
    let sliceLength = minLength;
    let numLength = String(yourNumber).length;
    if (numLength > minLength) {sliceLength = numLength;}
    
    // create a string of zeroes
    let zeroString = '';
    for (let i = 0; i < sliceLength; i++) {zeroString += '0';}
    
    // return a string that is at least the length of minLength
    return (zeroString + String(yourNumber)).slice(numLength);
  },
  getFormattedTimerTime: function (elapsedSeconds) {

    // convert to timer display format
    let seconds = elapsedSeconds % 60;
    let minutes = Math.floor((elapsedSeconds / 60) % 60);
    let hours = Math.floor(elapsedSeconds / 3600);

    return this.zeroPadder(hours) +':'+ this.zeroPadder(minutes) +':'+ this.zeroPadder(seconds);
  }
}

