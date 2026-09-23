/**
 * NewAccountBox — 创建账号表单（region/user/pass/confirm）。
 *
 * forwardRef 暴露 submit()：优先 form.requestSubmit，否则直接校验提交。
 * 多区域时显示 select，单区域用 hidden input。
 *
 * 由 gui/screen/mainMenu/newAccount/NewAccountBox.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"; // 孪生（react 外部依赖）
import {
  MAX_PASS_LEN,
  MAX_USERNAME_LEN,
  MIN_PASS_LEN,
  MIN_USERNAME_LEN,
} from "network/WolConfig"; // 已转换

/** 暴露给父级的 ref API。 */
export interface NewAccountBoxHandle {
  /** 触发表单提交。 */
  submit(): void;
}

/** 组件 props。 */
export interface NewAccountBoxProps {
  /** 区域列表。 */
  regions: any[];
  /** 初始区域。 */
  initialRegion: any;
  /** i18n 字典。 */
  strings: any;
  /** 区域变更回调。 */
  onRegionChange: (id: string) => void;
  /** 提交回调。 */
  onSubmit: (payload: {
    user: string;
    pass: string;
    passMatch: boolean;
    regionId: string;
  }) => void;
}

/** 创建账号表单。 */
export const NewAccountBox = forwardRef<NewAccountBoxHandle, NewAccountBoxProps>(
  (
    { regions, initialRegion, strings: strings, onRegionChange, onSubmit },
    ref,
  ) => {
    let [regionId, setRegionId] = useState(initialRegion.id);
    let formRef = useRef<HTMLFormElement | null>(null);
    let userRef = useRef<HTMLInputElement | null>(null);
    let passRef = useRef<HTMLInputElement | null>(null);
    let confirmRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      setTimeout(() => userRef.current?.focus(), 50);
    }, []);
    const doSubmit = () => {
      onSubmit(
        (() => {
          let payload = {
            user: userRef.current!.value,
            pass: passRef.current!.value,
            passMatch: passRef.current!.value === confirmRef.current!.value,
            regionId,
          };
          return payload;
        })(),
      );
    };
    useImperativeHandle(ref, () => ({
      submit() {
        formRef.current?.requestSubmit ? formRef.current.requestSubmit() : doSubmit();
      },
    }));
    return React.createElement(
      "div",
      { className: "login-wrapper new-account-box" },
      React.createElement("div", { className: "title" }, strings.get("GUI:NewAccount")),
      React.createElement(
        "form",
        {
          onSubmit: (e: any) => {
            e.preventDefault();
            doSubmit();
          },
          className: "login-form login-box",
          ref: formRef,
        },
        1 < regions.length
          ? React.createElement(
              "div",
              { className: "field" },
              React.createElement("label", null, strings.get("TS:Region")),
              React.createElement(
                "select",
                {
                  name: "server",
                  value: regionId,
                  onChange: (e: any) => {
                    var id = e.target.value;
                    setRegionId(id);
                    onRegionChange(id);
                  },
                },
                regions.map((r) =>
                  React.createElement(
                    "option",
                    { value: r.id, key: r.id, disabled: !r.available },
                    r.label,
                  ),
                ),
              ),
            )
          : React.createElement("input", {
              type: "hidden",
              name: "server",
              value: regionId,
            }),
        React.createElement(
          "div",
          { className: "field" },
          React.createElement("label", null, strings.get("GUI:Nickname")),
          React.createElement("input", {
            name: "user",
            type: "text",
            required: true,
            minLength: MIN_USERNAME_LEN,
            maxLength: MAX_USERNAME_LEN,
            ref: userRef,
            autoComplete: "off",
          }),
        ),
        React.createElement(
          "div",
          { className: "field" },
          React.createElement("label", null, strings.get("GUI:Password")),
          React.createElement("input", {
            name: "pass",
            type: "password",
            required: true,
            minLength: MIN_PASS_LEN,
            maxLength: MAX_PASS_LEN,
            ref: passRef,
            autoComplete: "off",
          }),
        ),
        React.createElement(
          "div",
          { className: "field" },
          React.createElement("label", null, strings.get("GUI:Re-enterPassword")),
          React.createElement("input", {
            name: "confirmPass",
            type: "password",
            required: true,
            ref: confirmRef,
            autoComplete: "off",
          }),
        ),
        React.createElement("button", {
          type: "submit",
          style: { visibility: "hidden" },
        }),
      ),
    );
  },
);
