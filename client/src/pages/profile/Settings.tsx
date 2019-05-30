import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {ActionMeta, ValueType} from "react-select/lib/types";
import {OptionType} from "../../components/types";
import Select from 'react-select';


interface Props {

}

interface State {
    skins: {
        value: string;
        label: string;
    }[],
    selectedSkin: OptionType[],
}





/**
 * 
 */
export class Settings extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            skins: [
                {value:"matilda", label: "Matilda"},
                {value:"theDevilMadeMeDoIt", label: "The devil made me do it"}
            ],
            selectedSkin: []
        };
    }

    private readonly handleSkinChange = (value: ValueType<OptionType>, action: ActionMeta) => {
        let v = OptionType.resolve(value);
        let skin = v[0].value;
        let selectedSkin = OptionType.resolve(value);

        switch (skin) {
            case "theDevilMadeMeDoIt": {
                //--white: #ffffff;
                document.documentElement.style.setProperty('--white', '#ffffff');
                //--near-white: #f6f9fb;
                document.documentElement.style.setProperty('--near-white', 'red');
                //--faint-contrast: #f2f2f2;
                document.documentElement.style.setProperty('--faint-contrast', 'blue');
                //--near-white-contrast: #b3b3b3;
                document.documentElement.style.setProperty('--near-white-contrast', 'green');
                //--horizontal-rule: #dee2e5;
                document.documentElement.style.setProperty('--horizontal-rule', '#dee2e5');
                //--far-white-contrast: #e0e0e0;
                document.documentElement.style.setProperty('--far-white-contrast', 'pink');
                //--white-contrast: #565656;
                document.documentElement.style.setProperty('--white-contrast', 'purple');
                //--black: #373a47;
                document.documentElement.style.setProperty('--black', 'black');
                //--main-bg-color: #f6f9fb;
                document.documentElement.style.setProperty('--main-bg-color', 'yellow');
                //--main-bg-color-contrast: #eeeeee;
                document.documentElement.style.setProperty('--main-bg-color-contrast', 'aqua');
                //--light-visibility: #cccccc;
                document.documentElement.style.setProperty('--light-visibility', 'blue');
                //--medium-visibility: #999999;
                document.documentElement.style.setProperty('--medium-visibility', 'yellow');
                //--suggestion: #9fc1c0;
                document.documentElement.style.setProperty('--suggestion', 'orange');
                //--insist: #f15a24;
                document.documentElement.style.setProperty('--insist', 'green');
                //--thing-1: #c5e06f;
                document.documentElement.style.setProperty('--thing-1', 'blue');
                //--thing-2: #297d7d;
                document.documentElement.style.setProperty('--thing-1', 'yellow');
                //--gray: gray;
                document.documentElement.style.setProperty('--gray', 'gray');
                //--warning: red;
                document.documentElement.style.setProperty('--warning', 'green');
                //--caution: #f7931e;
                document.documentElement.style.setProperty('--caution', 'yellow');
                //--rainbow-red: #e02e4a;
                document.documentElement.style.setProperty('--rainbow-red', 'red');
                //--rainbow-orange: #dd642d;
                document.documentElement.style.setProperty('--rainbow-orange', 'orange');
                //--rainbow-yellow: #e8e628;
                document.documentElement.style.setProperty('--rainbow-yellow', 'yellow');
                //--rainbow-green: #61bf80;
                document.documentElement.style.setProperty('--rainbow-green', 'green');
                //--rainbow-blue: #60bbbd;
                document.documentElement.style.setProperty('--rainbow-blue', 'blue');
                //--rainbow-indigo: #6362ac;
                document.documentElement.style.setProperty('--rainbow-indigo', 'blue');
                //--rainbow-violet: #9563aa;
                document.documentElement.style.setProperty('--rainbow-violet', 'purple');
                //--hard-font: 'Montserrat', sans-serif;
                document.documentElement.style.setProperty('--hard-font', '"Economica", sans-serif');
                //--soft-font: 'Varela Round', sans-serif;
                document.documentElement.style.setProperty('--your-variable', '"Economica", sans-serif');
                
                //---INBOX---
                //--my-message-bubble: lightgrey;
                document.documentElement.style.setProperty('--my-message-bubble', 'pink');
                //--others-message-bubble: lightblue;
                document.documentElement.style.setProperty('--others-message-bubble', 'purple');
                //--open-conversation-selector: bisque;
                document.documentElement.style.setProperty('--open-conversation-selector', 'orange');
                //--closed-conversation-selector: lightgrey;
                document.documentElement.style.setProperty('--closed-conversation-selector', 'yellow');
                //--inbox-windows-bg: white;
                document.documentElement.style.setProperty('--inbox-windows-bg', 'red');

                this.setState({
                    selectedSkin: selectedSkin,
                });

                break;
            }
            case "matilda": {
                //--white: #ffffff;
                document.documentElement.style.setProperty('--white', '#ffffff');
                //--near-white: #f6f9fb;
                document.documentElement.style.setProperty('--near-white', '#f6f9fb');
                //--faint-contrast: #f2f2f2;
                document.documentElement.style.setProperty('--faint-contrast', '#f2f2f2');
                //--near-white-contrast: #b3b3b3;
                document.documentElement.style.setProperty('--near-white-contrast', '#b3b3b3');
                //--horizontal-rule: #dee2e5;
                document.documentElement.style.setProperty('--horizontal-rule', '#dee2e5');
                //--far-white-contrast: #e0e0e0;
                document.documentElement.style.setProperty('--far-white-contrast', '#e0e0e0');
                //--white-contrast: #565656;
                document.documentElement.style.setProperty('--white-contrast', '#565656');
                //--black: #373a47;
                document.documentElement.style.setProperty('--black', '#373a47');
                //--main-bg-color: #f6f9fb;
                document.documentElement.style.setProperty('--main-bg-color', '#f6f9fb');
                //--main-bg-color-contrast: #eeeeee;
                document.documentElement.style.setProperty('--main-bg-color-contrast', '#eeeeee');
                //--light-visibility: #cccccc;
                document.documentElement.style.setProperty('--light-visibility', '#cccccc');
                //--medium-visibility: #999999;
                document.documentElement.style.setProperty('--medium-visibility', '#999999');
                //--suggestion: #9fc1c0;
                document.documentElement.style.setProperty('--suggestion', '#9fc1c0');
                //--insist: #f15a24;
                document.documentElement.style.setProperty('--insist', '#f15a24');
                //--thing-1: #c5e06f;
                document.documentElement.style.setProperty('--thing-1', '#c5e06f');
                //--thing-2: #297d7d;
                document.documentElement.style.setProperty('--thing-2', '#297d7d');
                //--gray: gray;
                document.documentElement.style.setProperty('--gray', 'gray');
                //--warning: red;
                document.documentElement.style.setProperty('--warning', 'red');
                //--caution: #f7931e;
                document.documentElement.style.setProperty('--caution', '#f7931e');
                //--rainbow-red: #e02e4a;
                document.documentElement.style.setProperty('--rainbow-red', '#e02e4a');
                //--rainbow-orange: #dd642d;
                document.documentElement.style.setProperty('--rainbow-orange', '#dd642d');
                //--rainbow-yellow: #e8e628;
                document.documentElement.style.setProperty('--rainbow-yellow', '#e8e628');
                //--rainbow-green: #61bf80;
                document.documentElement.style.setProperty('--rainbow-green', '#61bf80');
                //--rainbow-blue: #60bbbd;
                document.documentElement.style.setProperty('--rainbow-blue', '#60bbbd');
                //--rainbow-indigo: #6362ac;
                document.documentElement.style.setProperty('--rainbow-indigo', '#6362ac');
                //--rainbow-violet: #9563aa;
                document.documentElement.style.setProperty('--rainbow-violet', '#9563aa');
                //--hard-font: "Montserrat", sans-serif;
                document.documentElement.style.setProperty('--hard-font', '"Montserrat", sans-serif');
                //--soft-font: "Varela Round", sans-serif;
                document.documentElement.style.setProperty('--soft-font', '"Varela Round", sans-serif');

                //---INBOX---
                //--my-message-bubble: lightgrey;
                document.documentElement.style.setProperty('--my-message-bubble', 'lightgrey');
                //--others-message-bubble: lightblue;
                document.documentElement.style.setProperty('--others-message-bubble', 'lightblue');
                //--open-conversation-selector: bisque;
                document.documentElement.style.setProperty('--open-conversation-selector', 'bisque');
                //--closed-conversation-selector: lightgrey;
                document.documentElement.style.setProperty('--closed-conversation-selector', 'lightgrey');
                //--inbox-windows-bg: white;
                document.documentElement.style.setProperty('--inbox-windows-bg', 'white');

                this.setState({
                    selectedSkin: selectedSkin,
                });

                break;
            }
            default:
                break;
        }
    }


    public render(): ReactNode {

        return (
            <Container fluid className="profile-settings">
                <Row>
                    <Col sm={12}><h3 className="profile-sub-title mt-1">settings</h3></Col>
                </Row>
                <Row className="mt-3">
                       <Col sm={4} className="profile-label">skin</Col>
                       <Col sm={8}>
                            <Select
                                options={this.state.skins}
                                value={this.state.selectedSkin}
                                onChange={this.handleSkinChange}
                                isMulti={false}
                                placeholder={"matilda"}
                            />
                       </Col>
                   </Row>
            </Container>
        );
    }

}