import styled from "styled-components";

import { colors } from "styles";

export const Select = styled.select`
  font-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;
  -webkit-border-radius: 0px;
  padding: 3px 6px;
  overflow: none;
  border: 2px solid ${colors.loginBg};
  background-color: white;
  cursor: pointer;
  width: 100%;
  &:focus,
  &:active {
    outline: none;
  }
`;

export const Option = styled.option`
  font-size: 14px;
`;
