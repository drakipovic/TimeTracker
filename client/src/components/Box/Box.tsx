import styled from "styled-components";

import { colors } from "styles";

const Box = styled.div<{ bgColor?: string }>`
  border-color: ${colors.mediumGray};
  padding: 20px;
  background-color: ${p => (p.bgColor ? p.bgColor : "white")};
`;

export default Box;
