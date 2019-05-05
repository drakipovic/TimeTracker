import * as React from "react";
import styled from "styled-components";

import { colors } from "styles";

interface TextAreaProps {
  id?: string;
  label?: string;
  height?: string;
  error?: string;
  value?: string;
  onChange?(e: React.SyntheticEvent<HTMLTextAreaElement>): void;
}

const TextAreaStyle = styled.textarea<{ error?: string; height?: string }>`
  height: ${p => p.height || "70px"};
  border: 2px solid ${p => (p.error ? colors.red : colors.loginBg)};
  padding: 5px;
  font-size: 14px;
  width: 100%;
  margin-bottom: ${p => (p.error ? "3px" : "20px")};
  box-sizing: border-box;

  &:focus,
  &:active {
    outline: none;
  }
  resize: none;
`;

const TextArea: React.SFC<TextAreaProps> = props => (
  <>
    {props.label && <label htmlFor={props.id}>{props.label}</label>}

    <TextAreaStyle
      onChange={props.onChange}
      value={props.value}
      error={props.error}
      height={props.height}
    />
    {props.error && (
      <small style={{ display: "block", marginBottom: "10px" }}>
        {props.error}
      </small>
    )}
  </>
);

export default TextArea;
