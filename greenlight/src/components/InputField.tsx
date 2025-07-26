import React from "react";

interface InputFieldProps {
    name: string;
    value: number;
    label: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
                                                   name,
                                                   value,
                                                   label,
                                                   placeholder,
                                                   onChange,
                                               }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="number"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border rounded px-3 py-2"
                placeholder={placeholder}
            />
        </div>
    );
};

export default InputField;