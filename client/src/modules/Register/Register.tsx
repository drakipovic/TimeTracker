import * as React from "react";
import { Redirect } from "react-router";
import styled from "styled-components";

import { Box, Row, Col, Input, Button } from "components";
import { colors } from "styles";
import { register } from "api";

const Wrapper = styled.div`
  background-color: ${colors.loginBg};
  height: 100vh;
  width: 100%;
`;

interface RegisterState {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
  redirect?: boolean;
  errorUsername?: string;
  errorName?: string;
  errorPassword?: string;
  errorConfirmPassword?: string;
  errorEmail?: string;
  uniqueError?: string;
}

class Register extends React.Component<any, RegisterState> {
  constructor(props: any) {
    super(props);

    this.state = {
      username: "",
      name: "",
      password: "",
      email: "",
      confirmPassword: ""
    };
  }

  register = () => {
    let { username, password, name, email, confirmPassword } = this.state;

    let hasError: boolean = false;

    if (!username) {
      this.setState({ errorUsername: "No username provided!" });
      hasError = true;
    }

    if (!password) {
      this.setState({ errorPassword: "No password provided!" });
      hasError = true;
    }

    if (!confirmPassword) {
      this.setState({ errorConfirmPassword: "No confirm password provided!" });
      hasError = true;
    }

    if (confirmPassword !== password) {
      this.setState({ errorConfirmPassword: "Passwords must be equal!" });
      hasError = true;
    }

    if (!name) {
      this.setState({ errorName: "No name provided!" });
      hasError = true;
    }

    if (!email) {
      this.setState({ errorEmail: "No email provided!" });
      hasError = true;
    }

    if (hasError) return;

    register({
      username: username,
      password: password,
      name: name,
      email: email
    })
      .then((r: any) => this.setState({ redirect: true }))
      .catch((e: any) =>
        this.setState({ uniqueError: "Username has to be unique!" })
      );
  };

  handleUsernameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      username: e.currentTarget.value,
      errorUsername: undefined,
      uniqueError: undefined
    });
  };

  handleNameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ name: e.currentTarget.value, errorName: undefined });
  };

  handleEmailChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ email: e.currentTarget.value, errorEmail: undefined });
  };

  handlePasswordChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      password: e.currentTarget.value,
      errorPassword: undefined
    });
  };

  handleConfirmPasswordChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      confirmPassword: e.currentTarget.value,
      errorConfirmPassword: undefined
    });
  };

  render() {
    let {
      username,
      password,
      name,
      email,
      redirect,
      errorUsername,
      errorName,
      errorPassword,
      errorEmail,
      uniqueError,
      confirmPassword,
      errorConfirmPassword
    } = this.state;

    return (
      <Wrapper>
        {redirect && <Redirect to="/login" />}

        <Row>
          <Col />
          <Col style={{ minWidth: "300px", marginTop: "100px" }}>
            <Box>
              <h2 style={{ textAlign: "center" }}>Register</h2>
              <Input
                label="Username"
                id="username"
                value={username}
                onChange={this.handleUsernameChange}
                error={errorUsername || uniqueError}
              />
              <Input
                label="Name"
                id="name"
                value={name}
                onChange={this.handleNameChange}
                error={errorName}
              />
              <Input
                label="Email"
                id="email"
                value={email}
                onChange={this.handleEmailChange}
                error={errorEmail}
              />
              <Input
                label="Password"
                id="password"
                type="password"
                value={password}
                error={errorPassword}
                onChange={this.handlePasswordChange}
              />
              <Input
                label="Confirm Password"
                id="confirm-password"
                type="password"
                value={confirmPassword}
                error={errorConfirmPassword}
                onChange={this.handleConfirmPasswordChange}
              />

              <div style={{ textAlign: "center" }}>
                <Button
                  type="button"
                  backgroundColor={colors.green}
                  style={{ textAlign: "center", margin: "10px 0" }}
                  fontSize="20px"
                  onClick={() => this.register()}
                >
                  Register
                </Button>
              </div>
            </Box>
          </Col>
          <Col />
        </Row>
      </Wrapper>
    );
  }
}

export default Register;
