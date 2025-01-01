import React from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useCreateBlockNote,
  GridSuggestionMenuController,
  SideMenuController,
  SideMenu,
  DragHandleButton
} from "@blocknote/react";
import EmojiPicker from 'emoji-picker-react';

const EmojiButton = ({ onSelectEmoji }) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const handleEmojiClick = (emojiObject, event) => {
    console.log('Emoji clicked:',emojiObject, event, );
    onSelectEmoji(emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>
      {showPicker && (
        <div style={{ position: 'absolute', zIndex: 1000 }}>
          <EmojiPicker onEmojiClick={handleEmojiClick}  />
        </div>
      )}
    </div>
  );
};
export default function BlockNoteDemo() {
  // Creates a new editor instance.
  const [blocks, setBlocks] = React.useState([]);
  const editor = useCreateBlockNote({
    initialContent: [
      {
        "id": "ba9d90b9-36fb-4d2f-80c2-3918039447af",
        "type": "paragraph",
        "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
        },
        "content": [
            {
                "type": "text",
                "text": "🥰Welcome",
                "styles": {}
            },
            {
                "type": "link",
                "href": "https://baidu.com",
                "content": [
                    {
                        "type": "text",
                        "text": " to this dem",
                        "styles": {}
                    }
                ]
            },
            {
                "type": "text",
                "text": "o!  大幅度发",
                "styles": {}
            }
        ],
        "children": []
    },
      {
          "id": "47a4e16f-9732-4ef0-8e86-ebcc781a949b",
          "type": "paragraph",
          "props": {
              "textColor": "default",
              "backgroundColor": "default",
              "textAlignment": "left"
          },
          "content": [
              {
                  "type": "text",
                  "text": "You can now toggle ",
                  "styles": {}
              },
              {
                  "type": "text",
                  "text": "blue",
                  "styles": {
                      "textColor": "blue",
                      "backgroundColor": "blue"
                  }
              },
              {
                  "type": "text",
                  "text": " and ",
                  "styles": {}
              },
              {
                  "type": "text",
                  "text": "code",
                  "styles": {
                      "code": true
                  }
              },
              {
                  "type": "text",
                  "text": " styles with new buttons in the Formatting Toolbar",
                  "styles": {}
              }
          ],
          "children": []
      },
      {
          "id": "038c0524-55cf-4a88-9997-a50088c1dcde",
          "type": "paragraph",
          "props": {
              "textColor": "default",
              "backgroundColor": "default",
              "textAlignment": "left"
          },
          "content": [
              {
                  "type": "text",
                  "text": "Select some text to try them out",
                  "styles": {}
              }
          ],
          "children": []
      },
      {
          "id": "4eb7b41c-5fbc-4418-86ff-60fe11b4375d",
          "type": "paragraph",
          "props": {
              "textColor": "default",
              "backgroundColor": "default",
              "textAlignment": "left"
          },
          "content": [],
          "children": []
      }
  ],
  });
  const handleSelectEmoji = (emoji) => {
    // 在这里处理选择的 Emoji，例如插入到编辑器中
    console.log('Selected Emoji:', emoji);
    const selection = editor.getSelection();
    console.log('Selection:', selection);
    if (selection) {
      // editor.insertInlineContent({type: 'emoji', content: emoji});
      editor.insertInlineContent(emoji)
    } else {
      editor.insertInlineContent(emoji);
    }
  };
  console.log('blocks:', blocks);
  // Renders the editor instance.
  return (
    <BlockNoteView editor={editor} formattingToolbar={false} onChange={(content) => setBlocks(editor.document)} sideMenu={false}>
      <SideMenuController
        sideMenu={(props) => (
          <SideMenu {...props}>
            {/* Button which removes the hovered block. */}
            {/* <RemoveBlockButton {...props} /> */}
            <DragHandleButton {...props} />
          </SideMenu>
        )}
      />
      <FormattingToolbar>
            <GridSuggestionMenuController
              triggerCharacter={":"}
              // Changes the Emoji Picker to only have 5 columns.
              columns={10}
              minQueryLength={2}
            />
            {/* 添加 Emoji 按钮 */}
        <EmojiButton onSelectEmoji={handleSelectEmoji} />
            <BlockTypeSelect key={"blockTypeSelect"} />

            {/* Extra button to toggle blue text & background */}
            {/* <BlueButton key={"customButton"} /> */}

            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"replaceFileButton"} />

            <BasicTextStyleButton
              basicTextStyle={"bold"}
              key={"boldStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"italic"}
              key={"italicStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"underline"}
              key={"underlineStyleButton"}
            />
            <BasicTextStyleButton
              basicTextStyle={"strike"}
              key={"strikeStyleButton"}
            />
            {/* Extra button to toggle code styles */}
            <BasicTextStyleButton
              key={"codeStyleButton"}
              basicTextStyle={"code"}
            />

            <TextAlignButton
              textAlignment={"left"}
              key={"textAlignLeftButton"}
            />
            <TextAlignButton
              textAlignment={"center"}
              key={"textAlignCenterButton"}
            />
            <TextAlignButton
              textAlignment={"right"}
              key={"textAlignRightButton"}
            />

            <ColorStyleButton key={"colorStyleButton"} />

            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />

            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
    </BlockNoteView>
  );
}
