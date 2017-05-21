function toRadians(degree) {
  return degree * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

export function drawCircle(center, radius) {
  return new Promise((resolve, reject) => {
    let arr = [];
    let p = 1;
    let d = 0;
    for(let i = 0; i<360; ++i, d+=p) {
      arr.push(computeOffset(center, radius, d));
    }
    
    arr.pop();
    arr.push(arr[0]);
    
    resolve(arr);

    if(arr.length === 0) {
	reject(new Error("arr is not defined"));
    }
  });
}

function computeOffset(center, radius, heading) {
    const EARTH_RADIUS = 6371;
    radius /= EARTH_RADIUS;
    heading = toRadians(heading);
    // http://williams.best.vwh.net/avform.htm#LL
    let fromLat = toRadians(center.latitude);
    let fromLng = toRadians(center.longitude);
    let cosDistance = Math.cos(radius);
    let sinDistance = Math.sin(radius);
    let sinFromLat = Math.sin(fromLat);
    let cosFromLat = Math.cos(fromLat);
    let sinLat = cosDistance * sinFromLat + sinDistance * cosFromLat * Math.cos(heading);
    let dLng = Math.atan2(
            sinDistance * cosFromLat * Math.sin(heading),
            cosDistance - sinFromLat * sinLat);

    let result = {
      latitude: toDegrees(Math.asin(sinLat)),
      longitude: toDegrees(fromLng + dLng)
    };

    return result;

}

