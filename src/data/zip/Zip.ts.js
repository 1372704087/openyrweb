// === Reconstructed SystemJS module: data/zip/Zip ===
// deps: ["data/Crc32","data/zip/ZipUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/zip/Zip", ["data/Crc32", "data/zip/ZipUtils"], function (e, t) {
  "use strict";
  var s, l, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "Zip",
        (i = class {
          constructor(e = !1) {
            ((this.zip64 = e),
              console.info("Started zip with zip64: " + this.zip64),
              (this.fileRecord = []),
              (this.finished = !1),
              (this.byteCounterBig = BigInt(0)),
              (this.outputStream = new ReadableStream({
                start: (e) => {
                  (console.info("OutputStream has started!"), (this.outputController = e));
                },
                cancel: () => {
                  console.info("OutputStream has been canceled!");
                },
              })));
          }
          enqueue(e) {
            this.outputController.enqueue(e);
          }
          close() {
            this.outputController.close();
          }
          getZip64ExtraField(e, t) {
            return l.ZipUtils.createByteArray([
              { data: 1, size: 2 },
              { data: 28, size: 2 },
              { data: e, size: 8 },
              { data: e, size: 8 },
              { data: t, size: 8 },
              { data: 0, size: 4 },
            ]);
          }
          isWritingFile() {
            return 0 < this.fileRecord.length && !1 === this.fileRecord[this.fileRecord.length - 1].done;
          }
          startFile(e, t) {
            if (this.isWritingFile() || this.finished)
              throw new Error("Tried adding file while adding other file or while zip has finished");
            console.info("Start file: " + e);
            var i = new Date(t);
            this.fileRecord = [
              ...this.fileRecord,
              {
                name: e,
                sizeBig: BigInt(0),
                crc: new s.Crc32(),
                done: !1,
                date: i,
                headerOffsetBig: this.byteCounterBig,
              },
            ];
            var r = new TextEncoder().encode(e),
              r = l.ZipUtils.createByteArray([
                { data: 67324752, size: 4 },
                { data: 45, size: 2 },
                { data: 2056, size: 2 },
                { data: 0, size: 2 },
                { data: l.ZipUtils.getTimeStruct(i), size: 2 },
                { data: l.ZipUtils.getDateStruct(i), size: 2 },
                { data: 0, size: 4 },
                { data: this.zip64 ? 4294967295 : 0, size: 4 },
                { data: this.zip64 ? 4294967295 : 0, size: 4 },
                { data: r.length, size: 2 },
                { data: this.zip64 ? 32 : 0, size: 2 },
                { data: r },
                { data: this.zip64 ? this.getZip64ExtraField(BigInt(0), this.byteCounterBig) : [] },
              ]);
            (this.enqueue(r), (this.byteCounterBig += BigInt(r.length)));
          }
          appendData(e) {
            if (!this.isWritingFile() || this.finished)
              throw new Error("Tried to append file data, but there is no open file!");
            (this.enqueue(e),
              (this.byteCounterBig += BigInt(e.length)),
              this.fileRecord[this.fileRecord.length - 1].crc.append(e),
              (this.fileRecord[this.fileRecord.length - 1].sizeBig += BigInt(e.length)));
          }
          endFile() {
            if (!this.isWritingFile() || this.finished)
              throw new Error("Tried to end file, but there is no open file!");
            {
              const t = this.fileRecord[this.fileRecord.length - 1];
              console.info("End file: " + t.name);
              var e = l.ZipUtils.createByteArray([
                { data: t.crc.get(), size: 4 },
                { data: t.sizeBig, size: this.zip64 ? 8 : 4 },
                { data: t.sizeBig, size: this.zip64 ? 8 : 4 },
              ]);
              (this.enqueue(e),
                (this.byteCounterBig += BigInt(e.length)),
                (this.fileRecord[this.fileRecord.length - 1].done = !0));
            }
          }
          finish() {
            if (this.isWritingFile() || this.finished) throw new Error("Empty zip, or there is still a file open");
            {
              console.info("Finishing zip");
              let o = BigInt(0);
              var e,
                t,
                i = this.byteCounterBig;
              (this.fileRecord.forEach((e) => {
                const { date: t, crc: i, sizeBig: r, name: s, headerOffsetBig: a } = e;
                var n = new TextEncoder().encode(s),
                  n = l.ZipUtils.createByteArray([
                    { data: 33639248, size: 4 },
                    { data: 45, size: 2 },
                    { data: 45, size: 2 },
                    { data: 2056, size: 2 },
                    { data: 0, size: 2 },
                    { data: l.ZipUtils.getTimeStruct(t), size: 2 },
                    { data: l.ZipUtils.getDateStruct(t), size: 2 },
                    { data: i.get(), size: 4 },
                    { data: this.zip64 ? 4294967295 : r, size: 4 },
                    { data: this.zip64 ? 4294967295 : r, size: 4 },
                    { data: n.length, size: 2 },
                    { data: this.zip64 ? 32 : 0, size: 2 },
                    { data: 0, size: 2 },
                    { data: 0, size: 2 },
                    { data: 0, size: 2 },
                    { data: 0, size: 4 },
                    { data: this.zip64 ? 4294967295 : a, size: 4 },
                    { data: n },
                    { data: this.zip64 ? this.getZip64ExtraField(r, a) : [] },
                  ]);
                (this.enqueue(n), (this.byteCounterBig += BigInt(n.length)), (o += BigInt(n.length)));
              }),
                this.zip64 &&
                  ((t = this.byteCounterBig),
                  (e = l.ZipUtils.createByteArray([
                    { data: 101075792, size: 4 },
                    { data: 44, size: 8 },
                    { data: 45, size: 2 },
                    { data: 45, size: 2 },
                    { data: 0, size: 4 },
                    { data: 0, size: 4 },
                    { data: this.fileRecord.length, size: 8 },
                    { data: this.fileRecord.length, size: 8 },
                    { data: o, size: 8 },
                    { data: i, size: 8 },
                  ])),
                  this.enqueue(e),
                  (this.byteCounterBig += BigInt(e.length)),
                  (t = l.ZipUtils.createByteArray([
                    { data: 117853008, size: 4 },
                    { data: 0, size: 4 },
                    { data: t, size: 8 },
                    { data: 1, size: 4 },
                  ])),
                  this.enqueue(t),
                  (this.byteCounterBig += BigInt(t.length))));
              i = l.ZipUtils.createByteArray([
                { data: 101010256, size: 4 },
                { data: 0, size: 2 },
                { data: 0, size: 2 },
                { data: this.zip64 ? 65535 : this.fileRecord.length, size: 2 },
                { data: this.zip64 ? 65535 : this.fileRecord.length, size: 2 },
                { data: this.zip64 ? 4294967295 : o, size: 4 },
                { data: this.zip64 ? 4294967295 : i, size: 4 },
                { data: 0, size: 2 },
              ]);
              (this.enqueue(i),
                this.close(),
                (this.byteCounterBig += BigInt(i.length)),
                (this.finished = !0),
                console.info(
                  "Done writing zip file. " +
                    `Wrote ${this.fileRecord.length} files and a total of ${this.byteCounterBig} bytes.`,
                ));
            }
          }
        }),
      );
    },
  };
});
