import {ValueType} from "react-select/lib/types";

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
            optionTypes = [...value];
        } else {
            // TODO 'as' work-around until bug fixed in TypeScript compiler: https://github.com/microsoft/TypeScript/issues/17002
            optionTypes = [value as OptionType];
        }
        return optionTypes;
    }

}
