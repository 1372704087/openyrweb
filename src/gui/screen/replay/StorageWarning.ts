/**
 * StorageWarning — 回放存储配额不足警告条。
 *
 * navigator.storage.estimate 后，若剩余 < 1MB 则渲染警告文案；
 * 无 estimate API 或数据不全时返回 null。
 *
 * 由 gui/screen/replay/StorageWarning.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useState } from "react"; // 孪生（react 外部依赖）

/** 字节 → 向上取整 MB。 */
function toMb(bytes: number): number {
  return Math.ceil(bytes / 1024 / 1024);
}

/** 组件 props。 */
export interface StorageWarningProps {
  /** i18n 字典。 */
  strings: any;
}

/** 存储配额警告。 */
export const StorageWarning = ({ strings: strings }: StorageWarningProps) => {
  const [estimate, setEstimate] = useState<any>();
  useEffect(() => {
    navigator.storage?.estimate &&
      navigator.storage
        .estimate()
        .then((e) => setEstimate(e))
        .catch((e) => console.warn("Couldn't get storage estimate", [e]));
  }, []);
  return estimate?.quota && estimate.usage && estimate.quota - estimate.usage < 1048576
    ? React.createElement(
        "div",
        { className: "storage-warning" },
        strings.get(
          "ts:storage_quota_warning",
          toMb(estimate.usage),
          toMb(estimate.quota),
        ),
      )
    : null;
};
