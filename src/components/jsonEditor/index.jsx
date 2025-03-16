import React, { useState, useEffect, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { jsonParseLinter } from "@codemirror/lang-json";
import { Button } from "antd";
import "./index.css";

const JsonEditor = (props) => {
    const {
        value = "{}",
        onChange,
        editable = true,
        width = "600px",
        height = "600px",
        theme = "dark",
        ...rest
    } = props;
    const [internalValue, setInternalValue] = useState(value);
    const [error, setError] = useState("");
    const editorRef = useRef(null);

    // 添加一个state跟踪是否需要修复
    const [fixNeeded, setFixNeeded] = useState(false);
    // 手动格式化方法
    const handleFormat = (currentVal) => {
        try {
            const val = currentVal || internalValue;
            const formatted = formatJSON(val);
            if (formatted !== val) {
                updateContent(formatted);
            }
            setError("");
        } catch (e) {
            setError(e.message || "Invalid JSON");
        }
    };

    // 格式化逻辑
    const formatJSON = (raw) => {
        if (!raw?.trim()) return raw;
        return JSON.stringify(JSON.parse(raw), null, 2);
    };

    // 更新编辑器内容
    const updateContent = (newValue) => {
        setInternalValue(newValue);
        onChange?.(newValue);
        if (editorRef.current) {
            editorRef.current.view.dispatch({
                changes: {
                    from: 0,
                    to: editorRef.current.view.state.doc.length,
                    insert: newValue,
                },
            });
        }
    };

    // 同步外部值变化
    useEffect(() => {
        if (value !== internalValue) {
            setInternalValue(value);
            // handleFormat(value);
            console.log("设置   ", value);
        }
    }, [value]);

    // 内容变化处理
    const handleChange = (newValue) => {
        setInternalValue(newValue);
        try {
            JSON.parse(newValue);
            setError("");
            onChange?.(newValue);
        } catch (e) {
            setError(e.message || "Invalid JSON");
            // 如果解析失败，可能是因为键名没有引号，尝试修复
            try {
                // 使用正则表达式为未加引号的键名添加引号
                const fixedJson = newValue.replace(
                    /(\{|,)\s*([a-zA-Z_$][\w$]*)\s*:/g,
                    (match, prefix, key) => `${prefix} "${key}":`
                );
                // 尝试解析修复后的JSON
                JSON.parse(fixedJson);

                // 如果成功解析，则更新编辑器内容
                setError("");
                // 无需立即更新编辑器，避免干扰用户输入
                // 但可以在失去焦点时应用修复
                setFixNeeded(true);
            } catch (innerError) {
                // 如果修复后仍然失败，显示原始错误
                setError(e.message || "Invalid JSON");
            }
        }
    };

    const handleBlur = () => {
        if (fixNeeded) {
            try {
                const fixedJson = internalValue.replace(
                    /(\{|,)\s*([a-zA-Z_$][\w$]*)\s*:/g,
                    (match, prefix, key) => `${prefix} "${key}":`
                );
                updateContent(fixedJson);
                setFixNeeded(false);
                handleFormat(fixedJson);
                return;
            } catch (e) {
                // 忽略错误
            }
        }
        // 原有的格式化逻辑
        handleFormat();
    };

    return (
        <div
            className="ujson-editor-container"
            style={{ width: width, height: height }}
        >
            {/* 格式化按钮 */}
            {editable && (
                <div className="ujson-editor-format-button">
                    <Button
                        size="small"
                        onClick={() => handleFormat()}
                        disabled={!editable}
                        type="primary"
                    >
                        ⚡ 格式化
                    </Button>
                </div>
            )}

            {/* 编辑器主体 */}
            <CodeMirror
                ref={editorRef}
                value={internalValue}
                height={height}
                width={width}
                extensions={[json(), linter(jsonParseLinter())]}
                onChange={handleChange}
                theme={theme}
                editable={editable}
                onBlur={handleBlur}
                {...rest}
            />

            {/* 错误提示 */}
            {error && <div className="ujson-editor-error">{error}</div>}
        </div>
    );
};

export default JsonEditor;
