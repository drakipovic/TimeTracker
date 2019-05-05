import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { colors } from "styles";

const NavbarStyles = styled.div`
  height: 50px;
  background-color: ${colors.navbar};
  width: 100%;
`;

const Navbar: React.FC = () => (
  <NavbarStyles>
    <img
      src="logo.png"
      alt="Logo"
      style={{ float: "left", maxHeight: "45px", marginTop: "2px" }}
    />
    <div
      onClick={() => localStorage.removeItem("token")}
      style={{ float: "right", marginTop: "15px", marginRight: "10px" }}
    >
      <Link to="/login" style={{ color: "white" }}>
        Logout
      </Link>
    </div>
  </NavbarStyles>
);

export default Navbar;
