// === Reconstructed SystemJS module: gui/component/GameResForm ===
// deps: ["react","classnames"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/GameResForm", ["react", "classnames"], function (e, t) {
  "use strict";
  var p, m;
  t && t.id;
  return {
    setters: [
      function (e) {
        p = e;
      },
      function (e) {
        m = e;
      },
    ],
    execute: function () {
      e(
        "GameResForm",
        ({
          closable: e,
          strings: i,
          defaultArchiveUrl: t,
          // OpenYRWeb one-click: when both URLs are configured, show a prominent button that
          // downloads both exes and auto-extracts the 6 required mix files.
          oneClickRa2Url: ra2Url,
          oneClickYrUrl: yrUrl,
          onDownloadArchive: r,
          onOneClickDownload: onOneClick,
          onBrowseFolder: s,
          onBrowseArchive: a,
          onDrop: n,
          onClose: o,
        }) => {
          let [l, c] = p.default.useState();
          var g = p.default.useCallback(
            (e) => {
              e.target === l && c(void 0);
            },
            [l],
          );
          return (
            p.default.useEffect(() => {
              let e = (e) => e.preventDefault();
              return (
                globalThis.addEventListener("drop", e),
                globalThis.addEventListener("dragover", e),
                () => {
                  (globalThis.removeEventListener("drop", e), globalThis.removeEventListener("dragover", e));
                }
              );
            }, []),
            p.default.createElement(
              "div",
              null,
              e && p.default.createElement("div", { className: "close-button", onClick: o }),
              p.default.createElement("div", { className: "title" }, i.get("ts:gameres_locate_title")),
              // OpenYRWeb: one-click download+extract button (shown only when both URLs are set).
              ra2Url && yrUrl &&
                p.default.createElement(
                  "div",
                  { className: "one-click-container" },
                  p.default.createElement(
                    "p",
                    { className: "desc" },
                    i.get("ts:gameres_oneclick_desc"),
                  ),
                  p.default.createElement(
                    "p",
                    { className: "browse-buttons" },
                    p.default.createElement(
                      "button",
                      { className: "dialog-button primary", onClick: onOneClick },
                      i.get("ts:gameres_oneclick_button"),
                    ),
                  ),
                ),
              // OpenYRWeb: slimmed manual-import section. Drag/drop still works on this box,
              // but the example images + URL form were removed for a cleaner layout.
              p.default.createElement(
                "div",
                {
                  className: m.default("browse-container", { "dropzone-active": !!l }),
                  onDragOver: (e) => e.preventDefault(),
                  onDragLeave: g,
                  onDragEnter: (e) => {
                    [...e.dataTransfer.items].every((e) => "file" === e.kind) && c(e.target);
                  },
                  onDrop: (e) => {
                    (e.preventDefault(),
                      [...e.dataTransfer.items].every((e) => "file" === e.kind) && n(e.dataTransfer));
                  },
                },
                p.default.createElement("p", { className: "desc" }, i.get("ts:gameres_import_desc")),
                p.default.createElement(
                  "p",
                  { className: "browse-buttons" },
                  p.default.createElement(
                    "button",
                    { className: "dialog-button", onClick: s },
                    i.get("ts:gameres_browse_folder"),
                  ),
                  p.default.createElement(
                    "button",
                    { className: "dialog-button", onClick: a },
                    i.get("ts:gameres_browse_archive"),
                  ),
                ),
                p.default.createElement(
                  "p",
                  { className: "archive-formats" },
                  p.default.createElement("em", null, i.get("ts:gameres_supported_archive_formats")),
                ),
              ),
            )
          );
        },
      );
    },
  };
});
