import {
  Body,
  Description,
  ItemCard,
  ItemIcon,
  ItemLink,
} from "metabase/collections/components/PinnedItemCard/PinnedItemCard.styled";
import type { LinkProps } from "metabase/core/components/Link";
import * as Urls from "metabase/lib/urls";
import { Flex } from "metabase/ui";
import type { Card } from "metabase-types/api";

import { trackModelClick } from "../analytics";
import type { ModelResult } from "../types";
import { getIcon } from "../utils";

import { Title } from "./ModelCard.styled";
import { getModelDescription } from "./utils";

export interface ModelCardProps {
  model: ModelResult;
}

export const ModelCard = ({
  model,
  ...props
}: ModelCardProps & Partial<LinkProps>) => {
  const headingId = `heading-for-model-${model.id}`;

  const icon = getIcon(model);
  const description = getModelDescription(model);

  return (
    <ItemLink
      {...props}
      key={model.id}
      to={Urls.model(model as unknown as Partial<Card>)}
      onClick={() => trackModelClick(model.id)}
    >
      <ItemCard flat>
        <Body>
          <Flex pb="sm" align="center" h="2.75rem">
            <ItemIcon {...icon} style={{ flexShrink: 0 }} />
          </Flex>
          <Title tooltipMaxWidth="20rem" id={headingId} placement="bottom">
            {model.name}
          </Title>
          <Description>{description.replace(/\s+/g, " ")}</Description>
        </Body>
      </ItemCard>
    </ItemLink>
  );
};
