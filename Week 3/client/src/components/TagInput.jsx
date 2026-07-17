import { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags, onChange, placeholder = 'Add a tag and press Enter' }) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const clean = draft.trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) {
      onChange([...tags, clean]);
    }
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="input-field flex flex-wrap gap-1.5 items-center">
      {tags.map((tag) => (
        <span key={tag} className="tag-pill gap-1.5">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
      />
    </div>
  );
};

export default TagInput;
