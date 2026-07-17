import { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Heading2, List, ListOrdered, Quote, Link as LinkIcon } from 'lucide-react';

const TOOLBAR_ACTIONS = [
  { icon: Bold, command: 'bold', label: 'Bold' },
  { icon: Italic, command: 'italic', label: 'Italic' },
  { icon: Underline, command: 'underline', label: 'Underline' },
  { icon: Heading2, command: 'formatBlock', value: 'h2', label: 'Heading' },
  { icon: List, command: 'insertUnorderedList', label: 'Bullet list' },
  { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered list' },
  { icon: Quote, command: 'formatBlock', value: 'blockquote', label: 'Quote' },
];

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing…' }) => {
  const editorRef = useRef(null);

  // Keep the DOM in sync only when the value changes externally (e.g. loading
  // a post for editing), not on every keystroke — avoids cursor jumping.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const runCommand = useCallback((command, cmdValue) => {
    editorRef.current.focus();
    document.execCommand(command, false, cmdValue);
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleLink = () => {
    const url = window.prompt('Enter a URL');
    if (url) runCommand('createLink', url);
  };

  return (
    <div className="border border-ink/15 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink/10 bg-paper flex-wrap">
        {TOOLBAR_ACTIONS.map(({ icon: Icon, command, value: cmdValue, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => runCommand(command, cmdValue)}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-ink/10 text-ink/70 hover:text-ink transition-colors"
          >
            <Icon size={15} />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          onClick={handleLink}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-ink/10 text-ink/70 hover:text-ink transition-colors"
        >
          <LinkIcon size={15} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose-content min-h-[220px] max-h-[480px] overflow-y-auto px-4 py-3.5 text-sm outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-inkmuted"
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
