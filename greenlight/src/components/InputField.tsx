interface Props {
    name: string;
    value: number;
    label: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    width?: string; // e.g. "w-32", "w-40"
}

export default function InputField({
                                       name,
                                       value,
                                       label,
                                       placeholder,
                                       onChange,
                                       width = "w-32",
                                   }: Props) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type="number"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`border rounded px-2 py-1 text-sm ${width}`}
            />
        </div>
    );
}