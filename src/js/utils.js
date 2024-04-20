function msToTime(ms) {
  let str = " ms";
  str = (ms % 1000) + str;
  if (ms >= 1000) {
    let s = Math.floor(ms / 1000);
    str = (s % 60) + " s " + str;
    if (s >= 60) {
      let min = Math.floor(s / 60);
      str = (min % 60) + " min " + str;
      if (min >= 60) {
        let h = Math.floor(min / 60);
        str = h + " h " + str;
      }
    }
  }

  return str;
}
