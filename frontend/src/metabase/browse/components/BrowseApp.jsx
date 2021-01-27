import React from "react";
import { Box, Flex } from "grid-styled";

import { PAGE_PADDING } from "metabase/browse/constants";

import DatabaseBrowser from "../containers/DatabaseBrowser";

export default function BrowseApp({ children }) {
  return (
    <Flex>
      <DatabaseBrowser />
      {children}
    </Flex>
  );
}
