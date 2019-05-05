import * as React from "react";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Box, Row, Col, Input, Button, Line } from "components";
import { colors } from "styles";
import { login } from "api";

const Wrapper = styled.div`
  background-color: ${colors.loginBg};
  height: 100vh;
  width: 100%;
`;

interface LoginState {
  username: string;
  password: string;
  errorUsername?: string;
  errorPassword?: string;
  redirect?: boolean;
  error?: string;
}

class Login extends React.Component<any, LoginState> {
  constructor(props: any) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };
  }

  login = () => {
    let { username, password } = this.state;

    let hasError: boolean = false;

    if (!username) {
      this.setState({ errorUsername: "No username provided!" });
      hasError = true;
    }

    if (!password) {
      this.setState({ errorPassword: "No password provided!" });
      hasError = true;
    }

    if (hasError) return;

    login({ username: username, password: password })
      .then((r: any) => {
        localStorage.setItem("token", r.token);
        this.setState({ redirect: true });
      })
      .catch((e: any) =>
        this.setState({ error: "Wrong username or password!" })
      );
  };

  handleUsernameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      username: e.currentTarget.value,
      errorUsername: undefined
    });
  };

  handlePasswordChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      password: e.currentTarget.value,
      errorPassword: undefined
    });
  };

  render() {
    let {
      username,
      password,
      errorUsername,
      errorPassword,
      redirect,
      error
    } = this.state;

    return (
      <Wrapper>
        {redirect && <Redirect to="/" />}
        <Row>
          <Col />
          <Col style={{ minWidth: "300px", marginTop: "100px" }}>
            <Box>
              <h2 style={{ textAlign: "center" }}>Login</h2>
              <Input
                label="Username"
                id="username"
                value={username}
                onChange={this.handleUsernameChange}
                error={errorUsername}
              />
              <Input
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={this.handlePasswordChange}
                error={errorPassword}
              />
              <div style={{ textAlign: "center" }}>
                <Button
                  type="button"
                  backgroundColor={colors.green}
                  style={{ textAlign: "center", margin: "10px 0" }}
                  fontSize="20px"
                  onClick={this.login}
                >
                  Login
                </Button>
              </div>
              <>{error && <span style={{ color: colors.red }}>{error}</span>}</>
              <Line />
              New here?{" "}
              <Link
                to="/register"
                style={{ cursor: "pointer", color: colors.green }}
              >
                Create account
              </Link>
            </Box>
          </Col>
          <Col />
        </Row>
      </Wrapper>
    );
  }
}

export default Login;
