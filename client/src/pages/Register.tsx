import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Button} from "react-bootstrap";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import {RouteComponentProps} from "react-router-dom";
import "./Register.css";

import BasicInfo from './RegisterSubpages/BasicInfo';
import EmailConfirmation from './RegisterSubpages/EmailConfirmation';
import Interests from './RegisterSubpages/Interests';
import Personalization from './RegisterSubpages/Personalization';
import Agreement from './RegisterSubpages/Agreement';


interface Props extends RouteComponentProps{

}

interface State {
    step: number;
    username?: string;
    password?: string;
    email?: string;
    title: string;
    selectedOption?: any;
    personalizations?: any;
    tos?: boolean;
    nextDisabled?: boolean;
}

/**
 * 
 */
export class Register extends Component<Props, State> {

    /**
     * @override
     */

    constructor(props: Props)
    {
        super(props);

        this.state = {
            step: 1,
            username: "",
            password: "",
            email: "",
            title: "register",
            selectedOption: null,
            personalizations: {
                "profile": true,
                "tags": true,
                "notifications": true,
                "messages": true,
                "comments": true
            },
            tos: false,
            nextDisabled: false
        };
    }

    private readonly next = () => {
        const { step }: any = this.state;
        this.setState({
            step: step + 1
        })
    }

    private readonly prev = () => {
        const { step }: any = this.state;
        this.setState({
            step: step - 1
        })
    }

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13) {
            console.log('enter key pressed, do something');
        }
    };

    /**
     * @override
     */
    public getEmail = () => {
        return this.state.email;
    }

    /**
     * @override
     */
    public handleChange = (e: any) => {
        this.setState({[e.target.id]: e.target.value} as any);
    }

    /**
     * @override
     */
    public handlePersonalizationCheck = (checked: boolean, event: object, id: any) => {
        let personalizations = this.state.personalizations;
        personalizations[id] = checked;
        this.setState({personalizations: personalizations});
    };

    /**
     * @override
     */
    public handleCheck = (checked: boolean) => {
        if(this.state.tos)
            this.setState({tos: false});
        else
            this.setState({tos: true});
    };

    /**
     * @override
     */
    public getTos = () => {
        return this.state.tos;
    };

    /**
     * @override
     */
    public handleInterestChange = (selectedOption: string) => {
        this.setState({ selectedOption });
    }

        /**
     * @override
     */
    public handleJoin = () => {
        this.props.history.push("/login");
    }

    /**
     * @override
     */
    public componentDidMount() {
        document.addEventListener('keydown', this.enterKeyPressed);
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);
    }

    public render(): ReactNode {

        const content: { [key: number]: any } = {
                1: BasicInfo,
                2: EmailConfirmation,
                3: Interests,
                4: Personalization,
                5: Agreement
            };

        let CurrentContent = content[this.state.step];

        const title: { [key: number]: string } = {
            1: "register",
            2: "confirmation",
            3: "interests",
            4: "personalization",
            5: "agreement"
        };

    return (
        <Container fluid className="registerPage">
            <Row className="title">
                <Col sm={2}></Col>
                <Col sm={8}><h1>pdx connect</h1></Col>
                <Col sm={2}></Col>
            </Row>

            <Row className="subTitle">
                <Col sm={4}></Col>
                <Col sm={4}><h3>{title[this.state.step]}</h3></Col>
                <Col sm={4}></Col>
            </Row>
            <Row>
                <Col sm={3}></Col>
                <Col sm={6} className="registrationContent">
                    <CurrentContent
                        step={this.state.step}
                        prev={this.prev}
                        next={this.next} 
                        handleChange={this.handleChange}
                        handleInterestChange={this.handleInterestChange}
                        handlePersonalizationCheck={this.handlePersonalizationCheck}
                        handleCheck={this.handleCheck}
                        handleJoin={this.handleJoin}
                        getTos={this.getTos}
                        getEmail={this.getEmail}
                        selectedOption={this.state.selectedOption}
                        personalizations={this.state.personalizations}
                        />
                </Col>
                <Col sm={3}></Col>
            </Row>

            <Row className="directionalButtons">
                <Col sm={4}>{this.state.step != 1? <Button className="arrowButton" onClick={this.prev} ><FaArrowAltCircleLeft className="leftButton" size="4vw" /></Button>: null}
                {this.state.step == 1? <Button className="arrowButton" onClick={() => {this.props.history.push('/login')} } ><FaArrowAltCircleLeft className="leftButton" size="4vw" /></Button>: null}</Col>
                <Col sm={4}></Col>
                <Col sm={4}>{this.state.step != 5? <Button className="arrowButton" onClick={this.next} disabled={this.state.nextDisabled}><FaArrowAltCircleRight className="rightButton" size="4vw" /></Button>:null}</Col>
            </Row>
        </Container>
    );


    }

}