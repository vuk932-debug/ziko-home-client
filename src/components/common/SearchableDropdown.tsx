import React, { useState, useEffect } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { clsx } from 'clsx';

interface Option {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  options: Option[];
  selected: string;
  onChange: (name: string, id: string) => void;
  placeholder?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  inputClassName?: string;
  optionsClassName?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  loading = false,
  inputClassName,
  optionsClassName,
}) => {
  const [query, setQuery] = useState('');
  const [internalSelected, setInternalSelected] = useState<Option | null>(null);

  // Sync internal selected state when external 'selected' string or 'options' change
  useEffect(() => {
    if (selected) {
      const found = options.find(opt => opt.name === selected);
      if (found) setInternalSelected(found);
    } else {
      setInternalSelected(null);
    }
  }, [selected, options]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="w-full relative">
      {label && (
        <div className="mb-2">
          {label}
        </div>
      )}
      <Combobox
        value={internalSelected}
        onChange={(option: Option | null) => {
          if (option) {
            setInternalSelected(option);
            onChange(option.name, option.id);
            setQuery('');
          }
        }}
        disabled={disabled || loading}
      >
        <div className="relative">
          <ComboboxInput
            autoComplete="off"
            className={clsx(
              "w-full outline-none transition-all cursor-pointer",
              inputClassName || "px-4 py-2 bg-white border border-gray-300 rounded-lg"
            )}
            displayValue={(option: any) => option?.name || selected || ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={loading ? 'Synching...' : placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronsUpDown
              className="h-4 w-4 text-brand-secondary opacity-40 hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </ComboboxButton>

          <ComboboxOptions 
            anchor="bottom start"
            className={clsx(
              "z-[999] mt-1 max-h-60 min-w-[240px] w-[var(--input-width)] overflow-auto rounded-2xl py-2 text-base shadow-2xl border border-white/10 backdrop-blur-3xl",
              optionsClassName || "bg-brand-bg text-white"
            )}
          >
            {loading ? (
              <div className="relative cursor-default select-none py-3 px-4 text-brand-secondary opacity-50 italic flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-brand-neon border-t-transparent rounded-full animate-spin" />
                Synchronizing network...
              </div>
            ) : filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-3 px-4 text-brand-secondary opacity-50">
                No signal for "{query}"
              </div>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-pointer select-none py-3 pl-10 pr-6 transition-all rounded-xl mx-1 mb-0.5 last:mb-0',
                      active ? 'bg-brand-neon text-white shadow-glow-sm' : 'text-brand-secondary hover:bg-white/5'
                    )
                  }
                >
                  {({ selected: isSelected, active }) => (
                    <>
                      <span className={clsx('block whitespace-nowrap', isSelected ? 'font-black' : 'font-medium')}>
                        {option.name}
                      </span>
                      {isSelected ? (
                        <span className={clsx('absolute inset-y-0 left-0 flex items-center pl-3', active ? 'text-white' : 'text-brand-neon')}>
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};

export default SearchableDropdown;
