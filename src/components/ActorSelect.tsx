// src/components/ActorSelect.tsx

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ActorOut } from '../types/actors';

interface ActorSelectProps {
  id?: string;
  actors: ActorOut[];
  value: string;
  onChange: (actorId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
}

interface Option {
  id: string;
  label: string;
  sublabel?: string | null;
}

const UNASSIGNED_ID = '';

export function ActorSelect({
  id = 'actor-select',
  actors,
  value,
  onChange,
  disabled = false,
  loading = false,
  error = null,
}: ActorSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => actors.find((a) => a.actor_id === value) ?? null,
    [actors, value],
  );

  const options: Option[] = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? actors.filter(
          (a) =>
            a.actor_name.toLowerCase().includes(term) ||
            (a.email ?? '').toLowerCase().includes(term),
        )
      : actors;

    const mapped: Option[] = matches.map((a) => ({
      id: a.actor_id,
      label: a.actor_name,
      sublabel: a.email ?? null,
    }));

    return term ? mapped : [{ id: UNASSIGNED_ID, label: 'Unassigned' }, ...mapped];
  }, [actors, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const selectOption = (option: Option) => {
    onChange(option.id);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex((i) => Math.min(i + 1, Math.max(options.length - 1, 0)));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        // Never let Enter submit the surrounding form from this control
        e.preventDefault();
        if (open && options[activeIndex]) {
          selectOption(options[activeIndex]);
        } else if (!open) {
          setOpen(true);
        }
        break;
      case 'Escape':
        if (open) {
          // Close the list only; do not let the modal's Escape handler close the dialog
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          setQuery('');
        }
        break;
      case 'Tab':
        setOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  const inputValue = open ? query : selected?.actor_name ?? '';
  const placeholder = loading
    ? 'Loading actors...'
    : open
      ? 'Type to search actors...'
      : 'Unassigned';
  const listboxId = `${id}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[activeIndex] ? `${id}-opt-${activeIndex}` : undefined}
        autoComplete="off"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled || loading}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-3 pr-9 py-2 border border-surface-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-surface-900 disabled:bg-surface-50"
      />

      {value && !disabled && !loading && (
        <button
          type="button"
          onClick={() => {
            onChange(UNASSIGNED_ID);
            setQuery('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 text-xs p-1 rounded focus:outline-none"
          aria-label="Clear owner"
        >
          ✕
        </button>
      )}

      {open && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          className="absolute z-10 mt-1 w-full max-h-56 overflow-auto bg-white border border-surface-200 rounded-lg shadow-lg py-1 text-sm"
        >
          {error ? (
            <li className="px-3 py-2 text-red-600">{error}</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-surface-500">No actors match "{query}"</li>
          ) : (
            options.map((option, index) => {
              const isActive = index === activeIndex;
              const isSelected = option.id === value;
              return (
                <li
                  key={option.id || 'unassigned'}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                    isActive ? 'bg-surface-100' : ''
                  } ${isSelected ? 'font-semibold text-surface-900' : 'text-surface-700'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {option.sublabel && (
                    <span className="ml-3 text-xs text-surface-400 truncate">{option.sublabel}</span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}