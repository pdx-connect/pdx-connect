import * as React from "react";
import {Component} from "react";
import Select from 'react-select';
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import {Container, Row, Col} from "react-bootstrap";

import "./oobe.css";

interface Props {
    majors: OptionType[];
    tags: OptionType[];
    commuterStatus: OptionType[];
    selectedOptions: ValueType<OptionType>;
    handleInterestChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
    handleCommuterChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
    handleMajorChange: (value: ValueType<OptionType>, action: ActionMeta) => void;
}

export class About extends Component<Props, any> {

    /**
     * @override
     */
    public render() {
        const {commuterStatus, majors, tags, selectedOptions, handleInterestChange, handleCommuterChange, handleMajorChange} = this.props;
        return <Container fluid className="about">
            <Row>
                <Col sm={12} className="about-select">
                    <Select
                        options={tags}
                        value={selectedOptions}
                        onChange={handleInterestChange}
                        isMulti={true}
                        placeholder={'interests'}
                        className={'react-select-drop-down'}
                        classNamePrefix={'react-select'}
                    />
                </Col>
                <Col sm={12} className="about-select">
                    <Select
                        options={commuterStatus}
                        value={selectedOptions}
                        onChange={handleCommuterChange}
                        isMulti={false}
                        placeholder={'commuter status'}
                        className={'react-select-drop-down'}
                        classNamePrefix={'react-select'}
                    />
                </Col>
                <Col sm={12} className="about-select">
                    <Select
                        options={majors}
                        value={selectedOptions}
                        onChange={handleMajorChange}
                        isMulti={false}
                        placeholder={'major'}
                        className={'react-select-drop-down'}
                        classNamePrefix={'react-select'}
                    />
                </Col>   
            </Row>
        </Container>;
    }

}
