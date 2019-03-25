import * as React from "react";
import {Component} from "react";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import "../Register.css";

interface OptionType {
    label: string;
    value: string;
}

interface Props {
    selectedOption: ValueType<OptionType>;
    handleInterestChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
}

export class Interests extends Component<any, any> {

    /**
     * @override
     */
    public render() {
        const {selectedOption, handleInterestChange} = this.props;

        // TODO: Options need to be gathered from server
        // const options should be created dynamically based on tags in server
        const options: OptionType[] = [
            {value: 'food', label: 'Food'},
            {value: 'computer science', label: 'Computer Science'},
            {value: 'politics', label: 'Politics'},
            {value: 'gym', label: 'Gym'},
            {value: 'ride sharing', label: 'Ride Sharing'}
        ];

        return (
            <div>
                <Select
                    value={selectedOption}
                    onChange={handleInterestChange}
                    options={options}
                    isMulti={true}
                />
            </div>
        );
    }

}
