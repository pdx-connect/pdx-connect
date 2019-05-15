import React from "react";
import { Link } from "react-router-dom";
import { Nav, Container, Tabs, Tab } from "react-bootstrap";

const NavBar = () => {
  return (
<Nav justify variant="tabs" activeKey="/home">
  <Nav.Item>
    <Nav.Link href="/home">Calendar</Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="link-1">My Events</Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link eventKey="link-2">Search</Nav.Link>
  </Nav.Item>
  {/* <Nav.Item>
    <Nav.Link eventKey="disabled" disabled>
      Disabled
    </Nav.Link>
  </Nav.Item> */}
</Nav>
    // <Nav justify variant="tabs" activeKey="/Calendar">
    //   <Nav.Item>
    //     <Nav.Link href="/home">Calendar</Nav.Link>
    //   </Nav.Item>
    //   <Nav.Item>
    //     <Nav.Link eventKey="link-1">My Events</Nav.Link>
    //   </Nav.Item>
    //   <Nav.Item>
    //     <Nav.Link eventKey="link-2">Link</Nav.Link>
    //   </Nav.Item>
    //   <Nav.Item>
    //     <Nav.Link eventKey="disabled" disabled>
    //       Disabled
    //     </Nav.Link>
    //   </Nav.Item>
    // </Nav>
  );
};

export default NavBar;
