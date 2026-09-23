/**
 * LoginBox — 登录表单（区域列表 + 账号密码 + 突发新闻 + 调试按钮）。
 *
 * forwardRef 暴露 submit()；devMode 显示 LoginDebugUi；
 * breakingNewsUrl 经 Task 拉 HTML。
 *
 * 由 gui/screen/mainMenu/login/LoginBox.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"; // 孪生（react 外部依赖）
import { ServerList } from "gui/screen/mainMenu/login/ServerList"; // 孪生（本组内一并转换）
import { LoginDebugUi } from "gui/screen/mainMenu/login/LoginDebugUi"; // 孪生（本组内一并转换）
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { HttpRequest } from "network/HttpRequest"; // 已转换
import {
  MAX_PASS_LEN,
  MAX_USERNAME_LEN,
  MIN_USERNAME_LEN,
} from "network/WolConfig"; // 已转换

/** 暴露给父级的 ref API。 */
export interface LoginBoxHandle {
  /** 触发表单提交。 */
  submit(): void;
}

/** 组件 props。 */
export interface LoginBoxProps {
  /** 区域列表。 */
  regions: any[];
  /** 选中区域。 */
  selectedRegion?: any;
  /** 锁定用户名。 */
  selectedUser?: string;
  /** 区域 ping。 */
  pings: Map<any, any>;
  /** 突发新闻 URL。 */
  breakingNewsUrl?: string;
  /** i18n。 */
  strings: any;
  /** 调试按钮。 */
  devMode?: boolean;
  /** 区域变更。 */
  onRegionChange: (id: string) => void;
  /** 刷新区域列表。 */
  onRequestRegionRefresh: () => void;
  /** 提交（user, pass）。 */
  onSubmit: (user: string, pass: string) => void;
}

/** 登录表单。 */
export const LoginBox = forwardRef<LoginBoxHandle, LoginBoxProps>(
  (
    {
      regions,
      selectedRegion,
      selectedUser,
      pings,
      breakingNewsUrl,
      strings: strings,
      devMode,
      onRegionChange,
      onRequestRegionRefresh,
      onSubmit,
    },
    ref,
  ) => {
    let formRef = useRef<HTMLFormElement | null>(null);
    let userRef = useRef<HTMLInputElement | null>(null);
    let passRef = useRef<HTMLInputElement | null>(null);
    const [newsHtml, setNewsHtml] = useState<string>();
    useEffect(() => {
      setTimeout(() => userRef.current?.focus(), 50);
    }, []);
    useEffect(() => {
      if (breakingNewsUrl) {
        let task = new Task(async (cancel) => {
          let html = await new HttpRequest().fetchHtml(
            breakingNewsUrl,
            cancel,
          );
          html = html.trim();
          if (html.length) setNewsHtml(html);
        });
        task.start().catch((e) => console.error(e));
        return () => task.cancel();
      }
    }, [breakingNewsUrl]);
    const doSubmit = () => {
      if (userRef.current && passRef.current)
        onSubmit(userRef.current.value, passRef.current.value);
    };
    useImperativeHandle(ref, () => ({
      submit() {
        formRef.current?.requestSubmit
          ? formRef.current.requestSubmit()
          : doSubmit();
      },
    }));
    return React.createElement(
      "div",
      { className: "login-wrapper" },
      React.createElement("div", { className: "title" }, strings.get("GUI:Login")),
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
        React.createElement(
          "div",
          { className: "field" },
          React.createElement("label", null, strings.get("TS:Region")),
          selectedUser && selectedRegion
            ? React.createElement("input", {
                type: "text",
                value: selectedRegion.label,
                readOnly: true,
              })
            : React.createElement(
                React.Fragment,
                null,
                React.createElement(ServerList, {
                  regionId: selectedRegion?.id,
                  regions,
                  pings,
                  strings: strings,
                  onChange: (id: string) => {
                    onRegionChange(id);
                  },
                }),
                React.createElement("button", {
                  type: "button",
                  className: "icon-button refresh-button",
                  onClick: onRequestRegionRefresh,
                }),
              ),
        ),
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
            pattern: "[a-zA-Z0-9_\\-]+",
            autoComplete: "username",
            ref: userRef,
            value: selectedUser,
            readOnly: !!selectedUser,
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
            maxLength: MAX_PASS_LEN,
            autoComplete: "current-password",
            ref: passRef,
          }),
        ),
        React.createElement("button", {
          type: "submit",
          style: {
            visibility: "hidden",
            position: "absolute",
            width: 0,
            height: 0,
          },
        }),
      ),
      devMode &&
        React.createElement(LoginDebugUi, { onSubmit }),
      newsHtml &&
        React.createElement(
          "fieldset",
          { className: "news" },
          React.createElement("legend", null, strings.get("GUI:BreakingNews")),
          React.createElement("div", {
            dangerouslySetInnerHTML: { __html: newsHtml },
          }),
        ),
    );
  },
);
