import * as React from "react";
import {Component, ReactNode} from "react";
import {Container, Row, Col, Table} from "react-bootstrap";
import {FaUser} from "react-icons/fa";
import {postJSON} from "../../util/json";
import "./Profile.css";

interface Props {
    userID: number | undefined;
}

interface State {
    profile: DisplayProfile;
}

interface DisplayProfile {
    [key: string]: any;
}

interface Params {
    [key: string]: any;
}

/**
 * 
 */
export class ProfileContent extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            profile: {}
        };
    }

    componentDidMount() {
        const { match: { params } }: Params = this.props;

        if(params['userid'] != undefined) {
            this.setProfile(params.userid);
            console.log('cdm: ', params.userid);
        } else if (this.props.userID != undefined) {
            this.setProfile(this.props.userID);
            console.log('cdm: ', this.props.userID);
        }
    }

    private readonly getProfile = async (userId: number) => {
        const data = await postJSON("/api/search/finduser", {
            userId: userId,
        });

        return data;
    };

    private readonly setProfile = (userId: number) => {
        this.getProfile(userId).then(data => {
            this.setState({profile: data.user[0]});
        });
    };

    public render(): ReactNode {
        console.log('profilecontent: ', this.state.profile);

        let name = this.state.profile.displayName ? this.state.profile.displayName : "";
        let major = this.state.profile.major ? this.state.profile.major: "";
        
        console.log('name', name);

        return (
                <Container fluid className="profile-content">
                    <Row> 
                        <Col sm={3}>
                        <Table className="text-center profile-user-profile-img-table">
                                <tbody>
                                    <tr>
                                        <td><span className="profile-user-img"><FaUser size="8vw" className="profile-user-img-placeholder"></FaUser></span></td>
                                    </tr>
                                    <tr>
                                        <td className="profile-display-name">{name}</td>
                                    </tr>
                                </tbody>
                                </Table>
                        </Col>
                        <Col sm={1}></Col>
                        <Col sm={8}>
                            <Table className="profile-user-profile-table">
                                <tbody>
                                    <tr>
                                        <td>major</td>
                                    </tr>
                                    <tr>
                                        <td>{major}</td>
                                    </tr>
                                    <tr>
                                        <td>commuter</td>
                                    </tr>
                                    <tr>
                                        <td>commuter content</td>
                                    </tr>
                                    <tr>
                                        <td>about me</td>
                                    </tr>
                                    <tr>
                                        <td>about me content</td>
                                    </tr>
                                    <tr>
                                        <td>interests</td>
                                    </tr>
                                    <tr>
                                        <td>interests content</td>
                                    </tr>
                                </tbody>
                                </Table>
                        </Col>
                    </Row>
                </Container>

        );
    }

}