// === Reconstructed SystemJS module: gui/screen/replay/StorageWarning ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/replay/StorageWarning", ["react"], function (e, t) {
  "use strict";
  var r;
  t && t.id;
  function s(e) {
    return Math.ceil(e / 1024 / 1024);
  }
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e("StorageWarning", ({ strings: e }) => {
        const [t, i] = r.useState();
        return (
          r.useEffect(() => {
            navigator.storage?.estimate &&
              navigator.storage
                .estimate()
                .then((e) => i(e))
                .catch((e) => console.warn("Couldn't get storage estimate", [e]));
          }, []),
          t?.quota && t.usage && t.quota - t.usage < 1048576
            ? r.default.createElement(
                "div",
                { className: "storage-warning" },
                e.get("ts:storage_quota_warning", s(t.usage), s(t.quota)),
              )
            : null
        );
      });
    },
  };
});
