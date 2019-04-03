import * as React from "react";
import {Component} from "react";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";

import "../Register.css";

interface Props {
    options: OptionType[];
    selectedOptions: ValueType<OptionType>;
    handleInterestChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
}

export class Interests extends Component<Props, any> {

    /**
     * @override
     */
    public render() {
        const {options, selectedOptions, handleInterestChange} = this.props;
        return <div>
            <Select
                options={options}
                value={selectedOptions}
                onChange={handleInterestChange}
                isMulti={true}
            />
        </div>;
    }

}
