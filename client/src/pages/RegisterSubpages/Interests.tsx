import * as React from "react";
import {Component} from "react";
import Select from 'react-select';
import "../Register.css";



export class Interests extends Component<any, any> {

  render() {
    const { selectedOption, handleInterestChange } = this.props;

    // TODO: Options need to be gathered from server
    // const options should be created dynamically based on tags in server
    const options = [
        { value: 'food', label: 'Food' },
        { value: 'computer science', label: 'Computer Science' },
        { value: 'politics', label: 'Politics' },
        { value: 'gym', label: 'Gym' },
        { value: 'ride sharing', label: 'Ride Sharing' }
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

export default Interests
