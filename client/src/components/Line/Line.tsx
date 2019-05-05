import styled from "styled-components";

import { colors } from "styles";

const Line = styled.hr`
  height: 0;
  border: 0;
  border-top: 1px solid ${colors.mediumGray};
`;

export default Line;
