// === Reconstructed SystemJS module: util/geometry ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/geometry", ["util/math"], function (e, t) {
  "use strict";
  var s;
  t && t.id;
  return (
    e("pointEquals", function (e, t) {
      return (e && t && e.x === t.x && e.y === t.y) || (!e && !t);
    }),
    e("rectIntersect", function (e, t) {
      return e.x <= t.x + t.width && t.x <= e.x + e.width && e.y <= t.y + t.height && t.y <= e.y + e.height;
    }),
    e("rectEquals", function (e, t) {
      return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
    }),
    e("circleIntersect", function (e, t) {
      var i = e.center,
        r = t.center;
      return s.isBetween(
        (i.x - r.x) * (i.x - r.x) + (i.y - r.y) * (i.y - r.y),
        (e.radius - t.radius) * (e.radius - t.radius),
        (e.radius + t.radius) * (e.radius + t.radius),
      );
    }),
    e("circleContainsPoint", function (e, t) {
      var i = e.center;
      return (i.x - t.x) * (i.x - t.x) + (i.y - t.y) * (i.y - t.y) <= e.radius * e.radius;
    }),
    e("rectContainsPoint", function (e, t) {
      let i = new THREE.Box2(new THREE.Vector2(e.x, e.y), new THREE.Vector2(e.x + e.width, e.y + e.height));
      return i.containsPoint(new THREE.Vector2(t.x, t.y));
    }),
    e("rectContainsRect", function (e, t) {
      let i = new THREE.Box2(new THREE.Vector2(e.x, e.y), new THREE.Vector2(e.x + e.width, e.y + e.height));
      var r = new THREE.Box2(new THREE.Vector2(t.x, t.y), new THREE.Vector2(t.x + t.width, t.y + t.height));
      return i.containsBox(r);
    }),
    e("rectClampPoint", function (e, t) {
      let i = new THREE.Box2(new THREE.Vector2(e.x, e.y), new THREE.Vector2(e.x + e.width, e.y + e.height));
      return i.clampPoint(new THREE.Vector2(t.x, t.y), new THREE.Vector2());
    }),
    e("octileDistance", function (e, t) {
      var i = Math.abs(e.x - t.x),
        r = Math.abs(e.y - t.y);
      return i + r + (Math.SQRT2 - 2) * Math.min(i, r);
    }),
    {
      setters: [
        function (e) {
          s = e;
        },
      ],
      execute: function () {},
    }
  );
});
