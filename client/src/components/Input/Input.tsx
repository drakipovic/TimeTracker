import * as React from "react";
import styled from "styled-components";

import { colors } from "../../styles";

interface InputProps {
  label?: string;
  id?: string;
  type?: string;
  value?: string | number;
  error?: string;
  onChange?(e: React.SyntheticEvent<HTMLInputElement>): void;
}

const InputStyle = styled.input<{ error?: string }>`
  padding: 5px;
  border: 2px solid ${p => (p.error ? colors.red : colors.loginBg)};
  width: 100%;
  font-size: 16px;
  margin-bottom: ${p => (p.error ? "0px" : "10px")};
  box-sizing: border-box;

  &:focus,
  &:active {
    outline: none;
  }
`;

const Input: React.FC<InputProps> = props => (
  <>
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    <InputStyle
      value={props.value ? props.value : ""}
      id={props.id}
      type={props.type}
      error={props.error}
      onChange={props.onChange}
    />
    {props.error && (
      <small style={{ display: "block", marginBottom: "10px" }}>
        {props.error}
      </small>
    )}
  </>
);

export default Input;
