import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import CreateBountyBtn from "~/components/Bounty/CreateBountyBtn";
import Button from "~/components/Form/Button";
import { css, StyleSheet } from "aphrodite";
import isQuillEmpty from "./lib/isQuillEmpty";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type CommentEditorArgs = {
  previewWhenInactive?: boolean;
  placeholder?: string;
  handleSubmit: Function;
  content?: string;
  allowBounty?: boolean;
};

const CommentEditor = ({
  previewWhenInactive = false,
  placeholder = "Add comment or start a bounty",
  handleSubmit,
  content = "",
  allowBounty = false,
}: CommentEditorArgs) => {
  const editorRef = useRef<any>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [_previewWhenInactive, _setPreviewWhenInactive] =
    useState(previewWhenInactive);
  const [_isPreview, _setIsPreview] = useState(previewWhenInactive);
  const _isPreviewRef = useRef(_isPreview);
  const [_content, _setContent] = useState<string>(content);
  const [_isFocused, _setIsFocused] = useState(false);

  const handleEditorChange = (value, delta, source, editor) => {
    const editorContents = editor.getContents();
    if (isQuillEmpty(editorContents)) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }

    _setContent(value);
  };

  useEffect(() => {
    const _handleClick = (e) => {
      const isOutsideClick =
        !_isPreviewRef.current && !editorRef.current?.contains(e.target);
      const excludedElems = [".reply-btn", ".edit-btn"];
      const clickOnExcluded = excludedElems.reduce(
        (prev, selector) => Boolean(prev || e.target.closest(selector)),
        false
      );

      if (previewWhenInactive && isOutsideClick && !clickOnExcluded) {
        _setIsPreview(true);
      }
      if (!isOutsideClick && !_isFocused) {
        _setIsFocused(true);
      }
    };

    document.addEventListener("click", _handleClick);

    return () => {
      document.removeEventListener("click", _handleClick);
    };
  }, []);

  useEffect(() => {
    if (_isFocused) {
      editorRef.current.focus();
    }
  }, [_isFocused]);

  return (
    <div
      ref={editorRef}
      className={css(styles.commentEditor)}
      onClick={() => {
        _setIsPreview(false);
        _isPreviewRef.current = false;
      }}
    >
      {_isPreview ? (
        <div>
          <div>{placeholder}</div>
        </div>
      ) : (
        <div>
          <ReactQuill
            placeholder={placeholder}
            theme="snow"
            value={_content}
            onChange={handleEditorChange}
          />
        </div>
      )}
      <div className={css(styles.actions)}>
        {allowBounty && (
          // @ts-ignore
          <CreateBountyBtn />
        )}
        <Button
          label={"Post"}
          onClick={() => handleSubmit({ content: _content })}
          disabled={isSubmitDisabled}
        />
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  commentEditor: {
    display: "flex",
    padding: "16px 24px",
    minHeight: 105,
    boxShadow: "0px 0px 15px rgba(36, 31, 58, 0.1)",
    borderRadius: 16,
    flex: "none",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
});

export default CommentEditor;