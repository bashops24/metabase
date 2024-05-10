import styled from "@emotion/styled";

import { Ellipsified } from "metabase/core/components/Ellipsified";
import { color } from "metabase/lib/colors";

export const Title = styled(Ellipsified)`
  font-weight: bold;
  line-height: 1.5rem;
  width: 100%;
  &:hover {
    color: ${color("brand")};
  }
`;
