import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from 'codemirror';
import { json } from "@codemirror/lang-json";

type Props = {
  id: number;
  title: string;
  value: string;
  onChange: (v: string) => void;
};

export default function JSONInput ({ id, title, value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        json(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, [id]);

  return <div className="w-full grid grid-cols-[200px_auto] gap-2">
    <span className="grow-1 text-lg truncate">{title}</span>
    <div ref={editorRef} className="border rounded h-[400px]" />
  </div>
};
