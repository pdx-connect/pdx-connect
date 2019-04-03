import * as React from "react";

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
