import * as React from "react";
import {ReactNode} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {Page} from "../Page";
import {RouteComponentProps} from "react-router";
import { FaEdit, FaRedo, FaCheck} from 'react-icons/fa';
import {postJSON} from "../util/json";

import "./Reset.css";


interface Props extends RouteComponentProps {
    
}

interface State {
    email: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
    verificationCodeSent: boolean;
    verificationCodeMatch: boolean;
    matchMessage: string;
}

/**
 * 
 */
export class Reset extends Page<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            verificationCode: "",
            newPassword: "",
            confirmPassword: "",
            verificationCodeSent: false,
            email: "",
            verificationCodeMatch: false,
            matchMessage: ""
        };
    }

    private readonly updateEmailAccount = () => {
        this.setState({
            verificationCode: "",
            newPassword: "",
            confirmPassword: "",
            verificationCodeSent: false,
            email: "",
            verificationCodeMatch: false,
            matchMessage: ""
        });
    };

    private readonly resendVerificationCode = () => {
        console.log('TODO: resend verification code');
    };

    private readonly setVerificationCode = (e: any) => {
        this.setState({verificationCode: e.target.value});
    };

    private readonly setEmail = (e: any) => {
        this.setState({email: e.target.value});
    };

    private readonly setNewPassword = (e: any) => {
        this.setState({newPassword: e.target.value});
    };

    private readonly setConfirmPassword = (e: any) => {
        this.setState({confirmPassword: e.target.value});
    };
    
    private readonly enterKeyPressed = async (e: any) => {
        if (e.keyCode === 13 && this.state.email.trim().length > 0) {
            e.preventDefault();
            if (this.state.verificationCodeSent) {
                if (this.state.verificationCodeMatch) {
                    if (this.state.newPassword != "" && this.state.confirmPassword != "") {
                        if (this.state.newPassword !== this.state.confirmPassword) {
                            this.setState({
                                newPassword: "",
                                confirmPassword: "",
                                matchMessage: "Passwords do not match!"
                            });
                        } else {
                            console.log("TODO: passwords match update user's password and redirect to login?");
                            if(await Reset.serverConfirm(this.state.email, this.state.verificationCode, this.state.newPassword)) {
                                this.props.history.push("/login");
                            }
                            else{
                                this.setState({
                                    matchMessage: ""
                                });
                            }
                        }
                    }
                } else if (this.state.verificationCode.trim().length > 0) {
                    if (await Reset.serverVerify(this.state.email, this.state.verificationCode)) {
                        this.setState({
                            verificationCodeMatch: true
                        });
                    }
                }
            } else if (await Reset.serverReset(this.state.email)) {
                this.setState({
                    verificationCodeSent: true
                });
            }
        }
    };

    private static async serverReset(email: string): Promise<boolean> {
        const data = await postJSON("/reset", {
            email: email
        });
        return 'success' in data;
    }

    private static async serverVerify(email: string, verificationCode: string): Promise<boolean> {
        const data = await postJSON("/reset/verify", {
            email: email,
            verificationCode: verificationCode
        });
        return 'success' in data;
    }

    private static async serverConfirm(email: string, verificationCode: string, newPassword: string) {
        const data = await postJSON("/reset/confirm", {
            email: email,
            verificationCode: verificationCode,
            newPassword: newPassword
        });
        return 'success' in data;
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
    
    /**
     * @override
     */
    public render(): ReactNode {

        return (
            <Container fluid className="reset">
                <Row className="title">
                    <Col sm={2}></Col>
                    <Col sm={8}><h1>pdx connect</h1></Col>
                    <Col sm={2}></Col>
                </Row>

                <Row className="subTitle">
                    <Col sm={2}></Col>
                    <Col sm={8}><h6>password reset</h6></Col>
                    <Col sm={2}></Col>
                </Row>


                <Row>
                    <Col sm={4}></Col>
                    <Col sm={4}>
                        <Form>
                            <Form.Group className="formBasic">
                                {!this.state.verificationCodeSent?
                                    <Form.Control type="email" placeholder="account email" className="generic" value={this.state.email} onChange={this.setEmail}/>
                                    :<Form.Control disabled type="email" placeholder="account email" className="generic" value={this.state.email} onChange={this.setEmail}/>
                                }
                                {this.state.verificationCodeSent? <span className="actionNotice">verification code sent</span> : null}
                                {this.state.verificationCodeSent? <span className="update">edit<Button variant="light" size="sm" onClick={this.updateEmailAccount}><FaEdit size="1.5vw"/></Button></span> : null}
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col sm={4}></Col>
                </Row>

                {this.state.verificationCodeSent?
                <Row>
                    <Col sm={4}></Col>
                    <Col sm={4}>
                        <Form>
                            <Form.Group className="formBasic">
                                <Form.Control type="text" className="generic" placeholder="verification code" onChange={this.setVerificationCode}/>
                                {this.state.verificationCodeMatch? <span className="actionNotice">Match <FaCheck size="1vw"/></span> : null}
                                {!this.state.verificationCodeMatch? <span className="update">resend code<Button variant="light" size="sm" onClick={this.resendVerificationCode}><FaRedo size="1.5vw"/></Button></span>: null}
                            </Form.Group>

                            <Form.Group className="formBasic">
                                {this.state.verificationCodeMatch?
                                    <Form.Control type="text" className="generic" value={this.state.newPassword} placeholder="new password" onChange={this.setNewPassword}/>
                                    :
                                    <Form.Control disabled type="text" className="generic" value={this.state.newPassword} placeholder="new password" onChange={this.setNewPassword}/>}
                            </Form.Group>

                            <Form.Group controlId="formBasic">
                                {this.state.verificationCodeMatch?
                                    <Form.Control type="text" className="generic" value={this.state.confirmPassword} placeholder="confirm new password" onChange={this.setConfirmPassword}/>
                                    :
                                    <Form.Control disabled type="text" className="generic" value={this.state.confirmPassword}placeholder="confirm new password" onChange={this.setConfirmPassword}/>}
                                    <span className="actionNoticeRed">{this.state.matchMessage}</span>
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col sm={4}></Col>
                </Row>
                :
                null}
            </Container>
        );
    }

}
