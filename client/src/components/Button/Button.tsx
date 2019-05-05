import styled from "styled-components";

export interface ButtonProps {
  color?: string;
  fontSize?: string;
  backgroundColor: string;
  backgroundHover?: string;
  padding?: string;
}

const Button = styled.button<ButtonProps>`
  padding: ${p => p.padding || "4px 12px"};
  font-size: ${p => p.fontSize || "16px"};
  cursor: pointer;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color || "white"};
  border-color: ${props => props.backgroundColor};
  transition: 0.2s ease-in-out;
  &:focus,
  &:active {
    outline: none;
  }
  &:hover {
    background-color: ${props =>
      props.backgroundHover || props.backgroundColor};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      opacity: 0.5;
      background-color: ${props => props.backgroundColor};
    }
  }
`;

export default Button;
