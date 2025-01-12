import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import React, { useState, useEffect } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";

function MyWangEditor() {
    // editor 实例
    // const [editor, setEditor] = useState<IDomEditor | null>(null) // TS 语法
    const [editor, setEditor] = useState(null); // JS 语法

    // 编辑器内容
    const [html, setHtml] = useState(
        "<p>hellohellohello</p><p>hello</p><p>hello</p><p>hello</p><p>hello</p><p>hello</p><p>hello</p><p>hello</p><p>hello</p><p><br></p>"
    );

    // 模拟 ajax 请求，异步设置 html
    // useEffect(() => {
    //     setTimeout(() => {
    //         setHtml("<p>hello world</p>");
    //     }, 1500);
    // }, []);

    // 工具栏配置
    // const toolbarConfig: Partial<IToolbarConfig> = {} // TS 语法
    const toolbarConfig = {
        // modalAppendToBody: true,
    }; // JS 语法

    // 编辑器配置
    const editorConfig = {
        // TS 语法
        // const editorConfig = {
        //                     // JS 语法
        justifyLeft: {
            defaultAlignment: "left",
        },
        placeholder: "请输入内容...",
        // readOnly: true,
        maxLength: 1000,
        maxHeight: 100,
        MENU_CONF: {
            defaultAlignment: "left",

            codeSelectLang: {
                codeLangs: [
                    { text: "CSS", value: "css" },
                    { text: "HTML", value: "html" },
                    { text: "XML", value: "xml" },
                    { text: "javascript", value: "javascript" },
                    // 其他
                ],
            },
        },
        onBlur: (editor) => {
            console.log("onChange==", editor.getHtml());
            setHtml(editor.getHtml());
        },
    };
    useEffect(() => {
        if (!editor) return;
        console.log("editor==", editor.getAllMenuKeys());
        console.log("justifyLeft=", editor.getMenuConfig("justifyLeft"));
        console.log("fontsize", editor.getMenuConfig("fontSize"));
        // editor.$textElem.css("text-align", "left");
        // editor.command.executeCommand("justifyLeft");
    }, [editor]);
    // 及时销毁 editor ，重要！
    useEffect(() => {
        return () => {
            if (editor == null) return;
            editor.destroy();
            setEditor(null);
        };
    }, [editor]);

    return (
        <>
            <div style={{ border: "1px solid #ccc", zIndex: 100 }}>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    style={{ borderBottom: "1px solid #ccc" }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    // value={html}
                    onCreated={setEditor}
                    // onChange={(editor) => {
                    //     setHtml(editor.getHtml());
                    //     // console.log(editor.children);
                    // }}
                    mode="simple"
                    style={{
                        maxHeight: "300px",
                        minHeight: 200,
                        overflowY: "auto",
                    }}
                />
            </div>
            <div style={{ marginTop: "15px" }}>{html}</div>
        </>
    );
}

export default MyWangEditor;
