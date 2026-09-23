/**
 * PartyInviteDialog — 组队邀请对话框（接受/拒绝 + 可选 60 秒屏蔽勾选）。
 *
 * 由 gui/component/PartyInviteDialog.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default / hooks
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 组队邀请对话框。
 * @param props - {inviterName,strings,showPreventionCheckbox,viewport,onAccept,onDecline}
 */
export const PartyInviteDialog = (props: any): any => {
  const {
    inviterName,
    strings,
    showPreventionCheckbox = false,
    viewport,
    onAccept,
    onDecline,
  } = props;
  const [hidden, setHidden] = hooks.useState(false);
  const [prevent, setPrevent] = hooks.useState(false);

  return React.createElement(
    Dialog,
    {
      hidden,
      viewport,
      zIndex: 100,
      buttons: [
        {
          label: strings.get("GUI:PartyInviteAccept"),
          disabled: showPreventionCheckbox && prevent,
          onClick: () => {
            setHidden(true);
            onAccept();
          },
        },
        {
          label: strings.get("GUI:PartyInviteDecline"),
          onClick: () => {
            setHidden(true);
            onDecline(prevent);
          },
        },
      ],
    },
    React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { style: { marginBottom: showPreventionCheckbox ? "12px" : "0" } },
        strings.get("GUI:PartyInviteReceived", inviterName),
      ),
      showPreventionCheckbox &&
        React.createElement(
          "label",
          { style: { display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "8px" } },
          React.createElement("input", {
            type: "checkbox",
            checked: prevent,
            onChange: (ev: any) => setPrevent(ev.target.checked),
            style: { marginRight: "8px", cursor: "pointer" },
          }),
          React.createElement(
            "span",
            { style: { fontSize: "12px", color: "yellow" } },
            strings.get("GUI:PartyInvitePrevent", 60),
          ),
        ),
    ),
  );
};
