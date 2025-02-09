import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropDownProps {
  options: Array<{ id: string; name: string; value: string }>;
  value: { id: string; name: string; value: string };
  onChange: (option: { id: string; name: string; value: string }) => void;
  buttonClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
}

const DropDown = ({
  options,
  value,
  onChange,
  buttonClassName = '',
  optionsClassName = '',
  optionClassName = ''
}: DropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value.name}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={optionsClassName}>
          {options.map((option) => (
            <div
              key={option.id}
              className={optionClassName}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;