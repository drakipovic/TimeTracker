import * as React from "react";
import styled from "styled-components";

import { colors } from "styles";

interface CollapsedProps {
  bgColor: string;
  title: string;
  hours?: number;
  borderColor: string;
  collapse(): void;
  collapsed: boolean;
}

const Wrapper = styled.div`
  margin-bottom: 10px;
`;

const Title = styled.div<{ bgColor: string; borderColor?: string }>`
  font-size: 16px;
  padding: 7px 14px;
  background-color: ${p => p.bgColor};
  cursor: pointer;
  border: 1px solid ${p => (p.borderColor ? p.borderColor : colors.loginBg)};
`;

const Collapsed: React.SFC<CollapsedProps> = props => (
  <Wrapper>
    <Title
      bgColor={props.bgColor}
      borderColor={props.borderColor}
      onClick={props.collapse}
    >
      <div style={{ float: "left" }}>{props.title}</div>
      {props.hours && <div style={{ float: "right" }}>{props.hours}h</div>}
      <div style={{ clear: "both" }} />
    </Title>
    {props.collapsed && props.children}
  </Wrapper>
);

export default Collapsed;
