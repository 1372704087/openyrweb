/**
 * Phobos 版本元数据（移植自 G:\Phobos-develop\src\Phobos.version.h）。
 *
 * 当前为 NIGHTLY 骨架构建：功能尚未落地，对局警告使用
 * "DO NOT SHIP IN MODS!"。
 */
const PRODUCT_NAME = "Phobos";
const PRODUCT_SUMMARY = "Ares-compatible YR engine extension";

/** 内部骨架版本：功能尚未落地，不宣称 Release。 */
const VERSION_MAJOR = 0;
const VERSION_MINOR = 1;
const VERSION_REVISION = 0;
const VERSION_PATCH = 0;
const PRERELEASE_SUFFIX = "dev";

const VERSION_PREFIX = "v";

/** 源码内置扩展：NIGHTLY（非稳定 release）。 */
export type PhobosBuildType = "nightly" | "testing" | "release";

const buildType = "nightly" as PhobosBuildType;
export const PHOBOS_BUILD_TYPE: PhobosBuildType = buildType;

export const PHOBOS_PRODUCT_NAME = PRODUCT_NAME;
export const PHOBOS_PRODUCT_SUMMARY = PRODUCT_SUMMARY;

/** 短版本号：v0.1 */
export const PHOBOS_SHORT_VERSION = `${VERSION_PREFIX}${VERSION_MAJOR}.${VERSION_MINOR}`;
/** 带后缀版本：v0.1-dev */
export const PHOBOS_FILE_VERSION_STR = PRERELEASE_SUFFIX
  ? `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_REVISION}.${VERSION_PATCH}-${PRERELEASE_SUFFIX}`
  : `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_REVISION}.${VERSION_PATCH}`;
/** PRODUCT_VERSION：v0.1-dev */
export const PHOBOS_PRODUCT_VERSION = `${VERSION_PREFIX}${VERSION_MAJOR}.${VERSION_MINOR}${PRERELEASE_SUFFIX ? `-${PRERELEASE_SUFFIX}` : ""}`;
/** 开发中标注 */
export const PHOBOS_DEV_LABEL = `${PHOBOS_PRODUCT_VERSION} - under development, no features yet`;

/**
 * VersionDescription（移植 Phobos.cpp）：
 * - NIGHTLY: "Phobos v0.1-dev. DO NOT SHIP IN MODS!"
 * - testing/开发中: "Phobos v0.1-dev - under development, no features yet"
 */
export function getPhobosVersionDescription(build: PhobosBuildType = buildType): string {
  if (build === "nightly") {
    return `${PRODUCT_NAME} ${PHOBOS_PRODUCT_VERSION}. DO NOT SHIP IN MODS!`;
  }
  return `${PRODUCT_NAME} ${PHOBOS_DEV_LABEL}`;
}

/** 是否应在界面上展示 testing 警告（对应 TESTING_BUILD 屏幕绘制）。 */
export function shouldShowPhobosVersionWarning(build: PhobosBuildType = buildType): boolean {
  return build !== "release";
}
