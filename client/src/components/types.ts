import * as React from "react";
import {ValueType} from "react-select/lib/types";

/**
 * Properties for React-Bootstrap Form.Control
 */
export interface FormControlProps {
    innerRef?: React.LegacyRef<this>;
    size?: 'sm' | 'lg';
    plaintext?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    value?: string;
    onChange?: React.FormEventHandler<this>;
    type?: string;
    id?: string;
    isValid?: boolean;
    isInvalid?: boolean;
}

export interface OptionType {
    label: string;
    value: string;
}

export namespace OptionType {

    /**
     * Resolves a ValueType into an array of OptionType.
     * @param value The ValueType to resolve.
     */
    export function resolve(value: ValueType<OptionType>): OptionType[] {
        let optionTypes: OptionType[];
        if (value == null) {
            optionTypes = [];
        } else if (Array.isArray(value)) {
            optionTypes = value;
        } else {
            optionTypes = [value];
        }
        return optionTypes;
    }
    
}
