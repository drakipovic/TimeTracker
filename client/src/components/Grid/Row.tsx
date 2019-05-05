import styled from "styled-components";

interface RowProps {
  removeMargin?: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin: ${p => (p.removeMargin ? "" : "0 -15px")};
`;

export default Row;
