// === Reconstructed SystemJS module: gui/screen/mainMenu/login/LoginDebugUi ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/login/LoginDebugUi", ["react"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      (e("TEST_USERS", (r = ["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8"])),
        e("TEST_PASSWORD", "testpass"),
        e("LoginDebugUi", ({ onSubmit: t }) =>
          i.createElement(
            "div",
            { className: "login-debug-ui" },
            i.createElement(
              "div",
              { className: "login-debug-buttons" },
              r.map((e) =>
                i.createElement(
                  "button",
                  { key: e, type: "button", className: "login-debug-button", onClick: () => t(e, "testpass") },
                  e,
                ),
              ),
            ),
          ),
        ));
    },
  };
});
