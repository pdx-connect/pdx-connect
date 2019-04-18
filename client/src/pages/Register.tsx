import * as React from "react";
import {Page} from "../Page";
import {ReactNode} from "react";
import {Container, Row, Col, Modal} from "react-bootstrap";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";
import {RouteComponentProps} from "react-router-dom";
import {BasicInfo} from './register/BasicInfo';
import {Agreement} from './register/Agreement';
import {EmailConfirmation} from './register/EmailConfirmation';
import {getJSON, postJSON} from "../util/json";

import "./Register.css";

interface Props extends RouteComponentProps {
}

interface State {
    step: number;
    displayName: string | null;
    password: string | null;
    email: string | null;
    title: string;
    tos: boolean;
    show: boolean;
    disabled: boolean;
    confirmed: boolean;
    confirmationCode: string;
    userID?: number;
    domain?: string;
    passwordDisabled?: boolean;
    authorized?: boolean | null;
    authorizationMsg?: string;
}

/**
 * 
 */
export class Register extends Page<Props, State> {

    /**
     * Creates the register page.
     */
    constructor(props: Props) {
        super(props);
        this.state = {
            step: 1,
            displayName: "",
            password: "",
            email: "",
            title: "",
            tos: false,
            show: false,
            disabled: false,
            confirmed: false,
            confirmationCode: "",
            userID: undefined,
            domain: "",
            passwordDisabled: false,
            authorized: null,
            authorizationMsg: ""
        };
    }

    private readonly next = () => {
        const { step }: any = this.state;
        if(step + 1 === 3){
            if(this.state.confirmed) {
                this.clearLocalStorage();
                this.props.history.push("/login");
            }
            else
                this.setState({
                    step: 2,
                });
        }
        else {
            this.setState({
                step: step + 1
            });
        }
    };

    private readonly prev = () => {
        const { step }: any = this.state;
        this.setState({
            step: step - 1
        })
    };

    // Similar to enterKeyPressed - pop up the Tos, then transfer to the next page from clicking "join" in the Tos
    // But this is for when the arrow is used instead of the enter key
    private readonly nextArrowPressed = (e: any) => {
        if (!(this.state.email === "" || this.state.displayName === "" || this.state.password === "")) {
            this.setState({show: true, authorized: true, authorizationMsg: ""});
        }
        else {
            this.setState({authorized: false, authorizationMsg: "Please enter your credentials"});
        }
    };

    private readonly enterKeyPressed = (e: any) => {
        if (e.keyCode === 13 && !(this.state.email === "" || this.state.displayName === "" || this.state.password === "")) {
            this.setState({show: true});
        }
    };

    private readonly closeTos = () => {
        this.setState({show: false});
    };

    private readonly registerUser = async (displayName: string, password: string, email: string, domain: string) => {
        const data = await postJSON("/register", {
            displayName: displayName,
            email: email.concat('@').concat(domain),
            password: password
        });
        
        if ('error' in data) {
            console.log("Error: ", data['error']);
            this.setState({
                authorized: false,
                authorizationMsg: data['error'],
                show: false,
            });
        } else {            
            this.setState({
                show: false,
                disabled: true,
                userID: data.userID,
                passwordDisabled: true
            });

            localStorage.setItem('displayName', displayName);
            localStorage.setItem('email', email);
            localStorage.setItem('disabled', 'true');
            localStorage.setItem('userID', data.userID.toString());

            this.next();
        }
    };

    private readonly verifyUser = async (userID: number, confirmationCode: string) => {
        const data = await postJSON("/register/verify", {
            userID: userID,
            verificationCode: confirmationCode
        });
        if ('error' in data) {
            console.log("Error: ", data.error);
        } else {
            this.setState({
                confirmed: true
            });
        }
    };
    
    private readonly getDomain = async (): Promise<string> => {
        return getJSON("/api/settings/email-domain");
    };

    private readonly serverResendCode = async(email: string, userID: number, domain: string) => {
        const data = await postJSON("/register/resend", {
            email: email.concat('@').concat(domain),
            userID: userID
        });
        return 'success' in data;
    };

    /**
     * @override
     */
    private readonly handleChange = (e: any) => {
        this.setState({
            [e.target.id]: e.target.value
        } as any);
    };
    
    private readonly handleCheck = () => {
        this.setState({
            tos: !this.state.tos
        });
        localStorage.setItem('tos', (!this.state.tos).toString());
    };
    
    private readonly getTOS = () => {
        return this.state.tos;
    };

    private readonly removeDomain = () => {

        if(this.state.email != null && this.state.email.includes('@')) {
            const email = this.state.email.split('@');
            return email[0];
        }

        return this.state.email;
    };
        
    private readonly handleJoin = () => {
            const email = this.removeDomain();
            this.setState({email: email});
            if (this.state.displayName != null && email != null && this.state.password != null && this.state.domain != null) {
                this.registerUser(this.state.displayName, this.state.password, email, this.state.domain).then();
            }
    };
    
    private readonly resendCode = () => {
        const email = this.removeDomain();
        if (email != null && this.state.userID != null && this.state.domain != null) {
            this.serverResendCode(email, this.state.userID, this.state.domain).then();
        }
    };
    
    private readonly confirmCode = () => {
        if (this.state.userID != null && this.state.confirmationCode != null) {
            this.verifyUser(this.state.userID, this.state.confirmationCode).then();
        }
    };

    private readonly resetRegistration = () => {
        this.clearLocalStorage();
        this.getDomain().then(domain => {
            this.setState({
                step: 1,
                displayName: "",
                password: "",
                email: "",
                title: "",
                tos: false,
                show: false,
                disabled: false,
                confirmed: false,
                confirmationCode: "",
                userID: undefined,
                domain: domain,
                passwordDisabled: false
            });
        });
    };

    public clearLocalStorage()
    {
        localStorage.removeItem('displayName');
        localStorage.removeItem('email');
        localStorage.removeItem('disabled');
        localStorage.removeItem('userID');
        localStorage.removeItem('tos');
    }
    
    /**
     * @override
     */
    public componentDidMount() {
        this.getDomain().then(domain => {
            let disabled = localStorage.getItem('disabled') ? localStorage.getItem('disabled') === 'true' : false;
            let userID = localStorage.getItem('userID') ? Number(localStorage.getItem('userID')) : undefined;
            let tos = localStorage.getItem('tos') ? localStorage.getItem('tos') === 'true': false;
            let email = localStorage.getItem('email') === null ? "" : localStorage.getItem('email');
            let displayName = localStorage.getItem('displayName') === null ? "" : localStorage.getItem('displayName');

            this.setState({
                domain: domain,
                disabled: disabled,
                userID: userID,
                tos: tos,
                email: email,
                displayName: displayName
            });
        });

        document.addEventListener('keydown', this.enterKeyPressed);
    }
    
    /**
     * @override
     */
    public componentWillUnmount() {
        document.removeEventListener('keydown', this.enterKeyPressed);
    }

    /**
     * @override
     */
    public render(): ReactNode {

        const content: { [key: number]: any } = {
            1: BasicInfo,
            2: EmailConfirmation
        };

        const CurrentContent = content[this.state.step];
        
        const title: { [key: number]: string } = {
            1: "register",
            2: "confirmation"
        };

        return (
            <Container fluid className="registerPage">
                <Row className="title">
                    <Col sm={2}/>
                    <Col sm={8}><h1>pdx connect</h1></Col>
                    <Col sm={2}/>
                </Row>

                <Row className="subTitle">
                    <Col sm={4}/>
                    <Col sm={4}><h3>{title[this.state.step]}</h3></Col>
                    <Col sm={4}/>
                </Row>
                <Row>
                    <Col sm={3}></Col>
                    <Col sm={6} className="notAuthorized">
                        {!this.state.authorized? <span>{this.state.authorizationMsg}</span> : null}
                    </Col>
                    <Col sm={3}></Col>
                </Row>
                <Row>
                    <Col sm={3} className="directionalButtons">
                        {this.state.step != 1 ?
                            <FaArrowAltCircleLeft className="leftButton" size="4vw" onClick={this.prev}/>
                            : <FaArrowAltCircleLeft className="leftButton" size="4vw" onClick={() => {this.props.history.push('/login')}}/>}
                    </Col>
                    <Col sm={6}>
                        <CurrentContent
                            step={this.state.step}
                            prev={this.prev}
                            next={this.next}
                            handleChange={this.handleChange}
                            email={this.state.email}
                            displayName={this.state.displayName}
                            password={this.state.password}
                            disabled={this.state.disabled}
                            resendCode={this.resendCode}
                            confirmCode={this.confirmCode}
                            confirmed={this.state.confirmed}
                            domain={this.state.domain}
                            resetRegistration={this.resetRegistration}
                            passwordDisabled={this.state.passwordDisabled}
                        />
                    </Col>
                    <Col sm={3} className="directionalButtons">
                        {this.state.step === 1?
                            <FaArrowAltCircleRight className="rightButton" size="4vw" onClick={this.nextArrowPressed}/> : null}
                        {this.state.confirmed && this.state.step === 2?
                            <FaArrowAltCircleRight className="rightButton" size="4vw" onClick={this.next}/> : null}
                    </Col>
                </Row>
                {this.state.passwordDisabled ?
                    null :
                    <Modal show={this.state.show} onHide={this.closeTos} className="tos">
                        <Modal.Header closeButton />
                        <Agreement
                            handleCheck={this.handleCheck}
                            handleJoin={this.handleJoin}
                            getTOS={this.getTOS}
                        />
                    </Modal>
                }
            </Container>
        );
    }

}
