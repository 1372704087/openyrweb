// === SystemJS wrapper for @datastructures-js/priority-queue (minimal implementation) ===
// Based on binary heap.
System.register("vendor/priority-queue", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      var PriorityQueue = class {
        constructor(e) {
          this.compare = e || ((a, b) => a - b);
          this.heap = [];
        }
        enqueue(e) {
          this.heap.push(e);
          this._bubbleUp(this.heap.length - 1);
        }
        dequeue() {
          var e = this.heap[0],
            t = this.heap.pop();
          this.heap.length > 0 && ((this.heap[0] = t), this._sinkDown(0));
          return e;
        }
        front() {
          return this.heap[0];
        }
        isEmpty() {
          return this.heap.length === 0;
        }
        toArray() {
          return this.heap.slice();
        }
        size() {
          return this.heap.length;
        }
        _bubbleUp(e) {
          for (; e > 0; ) {
            var t = ((e - 1) >> 1);
            if (this.compare(this.heap[e], this.heap[t]) >= 0) break;
            var i = this.heap[e];
            (this.heap[e] = this.heap[t]), (this.heap[t] = i), (e = t);
          }
        }
        _sinkDown(e) {
          for (var t = this.heap.length; ; ) {
            var i = e,
              r = (e << 1) + 1,
              s = r + 1;
            r < t && this.compare(this.heap[r], this.heap[i]) < 0 && (i = r);
            s < t && this.compare(this.heap[s], this.heap[i]) < 0 && (i = s);
            if (i === e) break;
            var n = this.heap[e];
            (this.heap[e] = this.heap[i]), (this.heap[i] = n), (e = i);
          }
        }
      };
      e("PriorityQueue", PriorityQueue);
    },
  };
});
