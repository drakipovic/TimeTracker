import * as React from "react";
import styled from "styled-components";

const LoaderStyle = styled.img`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

interface LoaderProps {
  global?: boolean;
}

const Loader: React.FC<LoaderProps> = props => (
  <>
    {props.global ? (
      <LoaderStyle src="global_loader.svg" alt="Spinner" />
    ) : (
      <img src="loader.svg" alt="Loader" height="30px"/>
    )}
  </>
);

export default Loader;
