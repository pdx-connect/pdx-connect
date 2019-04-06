import * as React from "react";
import {Component, ReactNode, Fragment} from "react";
import {Container, Row, Col, Modal, Button, ModalTitle} from "react-bootstrap";

interface Props {
    displayName: string | undefined;
    updateHistory: (value: string) => void,
}

interface State {
    showEdit?:boolean, // Determine whether or not to show the window.
    modal: keyof profileEdit;
}

/* Customize the content of each modal window */
const modalTitle: { [key: string]: string } = {
    "editPicture": 'Edit your Profile Picture',
    "editName": 'Edit your Name',
    "editMajor": 'Edit your Major',
    "editTags": 'Edit your Tags',
    "editCS": 'Update your Commuter Status',
    "editBio": "Update your Bio: "
};

const modalContent: { [key: string]: string } = {
    "editPicture": "To edit your picture, click \"Choose File\" and browse for an image on your computer.",
    "editName": "Type your new username in the box below: ",
    "editMajor": 'Type in your new major in the box below: ',
    "editTags": "Select your new tags: ",
    "editCS": 'Select your choice below: ',
    "editBio": "Update your bio below: "
};

export interface profileEdit {
    editPicture: string;
    editName: string;
    editMajor: string;
    editTags: string;
    editCS: string;
    editBio: string;
}


/**
 * 
 */
export class Profile extends Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            showEdit: false,
            modal: "editPicture"
        };
    }

    private readonly showEdit = () => {
        this.setState({
            showEdit: true
        })
    }

    private readonly closeEdit = () => {
        this.setState({
            showEdit: false
        })
    }

    private readonly setModalInfo = (e: keyof profileEdit) => {
        this.setState({
            showEdit: true,
            modal: e
        })
    };

    /* Set the input based on the option to edit. */
    private readonly setInput = () => {
        // Editing a profile picture
        if(this.state.modal === "editPicture") {
            return(
                <input type="file"></input>
            );
        // Editing commuter status
        } else if (this.state.modal === "editCS"){
            return(
                <Fragment>
                    <input type="checkbox" id="comm" name="comm"></input>
                    <label htmlFor="comm" defaultChecked> Commuter?</label>
                </Fragment>
            );
        }
        // Editing major, tags, name, or bio.
        else {
            return(
                <input type="text"></input>
            );
        }
    };

  
    
    /**
     * @override
     */
    public render(): ReactNode {

        const title = modalTitle[this.state.modal];
        const body = modalContent[this.state.modal];
        
        let displayName = this.props.displayName;
        if(displayName === undefined)
            displayName = "";

        return (
                <Container fluid className="profile">
                    <Row className="editPicture">
                        <h3>Profile Picture - <Button onClick={()=>this.setModalInfo("editPicture")}>Edit</Button></h3>
                        <Col sm={3}><img className="userImage" src="../resources/matilda.png"></img></Col>
                    </Row>

                    <br></br>

                    {/**/}
                    <Row className="editName">
                        <h3>Current Name: {displayName} - <Button onClick={()=>this.setModalInfo("editName")}>Edit</Button></h3>
                    </Row>

                    <br></br>

                    <Row className="editName">
                        <h3>Current Major: TODO - <Button onClick={()=>this.setModalInfo("editMajor")}>Edit</Button></h3>
                    </Row>

                    <br></br>

                    <Row className="editTags">
                        <h3>Current Tags: TODO - <Button onClick={()=>this.setModalInfo("editTags")}>Edit</Button></h3>
                    </Row>

                    <br></br>


                    <Row className="editCS">
                        <h3>Commuter Status: TODO - <Button onClick={()=>this.setModalInfo("editCS")}>Edit</Button></h3>
                    </Row>

                    <br></br>


                    <Row className="editBio">
                        <h3>Current Bio: TODO - <Button onClick={()=>this.setModalInfo("editBio")}>Edit</Button></h3>
                    </Row>
                    
                    <Modal show={this.state.showEdit} onHide={this.closeEdit} className="edit-modal">
                        <Modal.Header closeButton>
                            <Modal.Title>{title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {body}
                            {<br></br>}
                            {<br></br>}
                            {this.setInput()}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.closeEdit} disabled>Accept</Button>
                            <Button onClick={this.closeEdit} variant="secondary">Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                </Container>

        );
    }

}