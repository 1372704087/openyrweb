/**
 * QuickGameChat — 快速游戏聊天区（Chat + 玩家列表）。
 *
 * 菜单项：私聊；有 onInviteToTeam 时附加邀请。
 *
 * 由 gui/screen/mainMenu/quickGame/component/QuickGameChat.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { Chat } from "gui/component/Chat"; // 已转换
import { List } from "gui/component/List"; // 已转换
import { ChannelUser } from "gui/component/ChannelUser"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换

/** 组件 props。 */
export interface QuickGameChatProps {
  /** i18n 字典。 */
  strings: any;
  /** 消息列表。 */
  messages: any[];
  /** 频道。 */
  channels?: any[];
  /** 本地用户名。 */
  localUsername: string;
  /** 用户列表。 */
  users: any[];
  /** 聊天历史。 */
  chatHistory: any;
  /** 玩家档案。 */
  playerProfiles: Map<string, any>;
  /** 发送消息。 */
  onSendMessage: (msg: any) => void;
  /** 邀请入队（可选）。 */
  onInviteToTeam?: (user: any) => void;
}

/** 快速游戏聊天组件。 */
export const QuickGameChat = ({
  strings: strings,
  messages,
  channels,
  localUsername,
  users,
  chatHistory,
  playerProfiles,
  onSendMessage,
  onInviteToTeam,
}: QuickGameChatProps) => {
  const menuItems: any[] = [
    {
      label: strings.get("GUI:PlayerMenuMessage"),
      onClick: (user: any) => {
        chatHistory.lastComposeTarget.value = {
          type: ChatRecipientType.Whisper,
          name: user.name,
        };
      },
    },
  ];
  if (onInviteToTeam)
    menuItems.push({
      label: strings.get("GUI:PlayerMenuInvite"),
      onClick: onInviteToTeam,
    });
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Chat, {
      strings: strings,
      messages,
      channels: channels ?? [],
      chatHistory,
      localUsername,
      onSendMessage,
      tooltips: {
        input: strings.get("STT:LobbyEditInput"),
        output: strings.get("STT:LobbyEditOutput"),
        button: strings.get("STT:EmoteButton"),
      },
    }),
    React.createElement(
      List,
      { className: "players-list", tooltip: strings.get("STT:LobbyListUsers") },
      users.map((user) => {
        var profile = playerProfiles.get(user.name);
        return React.createElement(ChannelUser, {
          key: user.name,
          user,
          playerProfile: profile,
          strings: strings,
          localUsername,
          menuItems,
        });
      }),
    ),
  );
};
