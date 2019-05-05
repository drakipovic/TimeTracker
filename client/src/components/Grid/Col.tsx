import styled from "styled-components";

interface ColProps {
  w?: number;
  removePadding?: boolean;
  removeOverflow?: boolean;
}

const Col = styled.div<ColProps>`
  flex: ${p => p.w || 1};
  padding: ${p => (p.removePadding ? "" : "0 15px")};
  overflow: ${p => (p.removeOverflow ? "" : "hidden")};
`;

export default Col;
