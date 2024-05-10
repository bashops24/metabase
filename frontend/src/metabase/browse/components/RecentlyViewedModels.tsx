import { skipToken, useListRecentItemsQuery } from "metabase/api";
import { DelayedLoadingAndErrorWrapper } from "metabase/components/LoadingAndErrorWrapper/DelayedLoadingAndErrorWrapper";
import { Box, Text } from "metabase/ui";

import type { ModelResult, RecentModel } from "../types";

import { ModelCard } from "./ModelCard";
import { RecentlyViewedModelsGrid } from "./RecentlyViewedModels.styled";
import { getCountOfRecentlyViewedModelsToShow } from "./utils";

export const RecentlyViewedModels = ({
  modelCount,
  applyCurrentFilters,
}: {
  /** The number of recently viewed models shown
   * depends on the number of models shown in the table below. */
  modelCount: number;
  applyCurrentFilters: (unfilteredModels: ModelResult[]) => ModelResult[];
}) => {
  const cap = getCountOfRecentlyViewedModelsToShow(modelCount);

  const {
    data: recentItems = [],
    error,
    isLoading,
  } = useListRecentItemsQuery(cap ? undefined : skipToken, {
    refetchOnMountOrArgChange: true,
  });

  if (!cap) {
    return null;
  }

  const recentlyViewedModels = recentItems.filter(
    data => data.model === "dataset",
  ) as RecentModel[];

  const filteredRecentItems: ModelResult[] =
    applyCurrentFilters(recentlyViewedModels);

  const slicedArray = filteredRecentItems.slice(0, cap);

  const headerId = "recently-viewed-models-heading";

  return (
    <>
      <RecentlyViewedModelsHeader id={headerId} />
      <DelayedLoadingAndErrorWrapper
        error={error}
        loading={isLoading}
        blankComponent={<Box mih="129px" />}
      >
        <RecentlyViewedModelsGrid role="grid" aria-labelledby={headerId}>
          {slicedArray.map(model => {
            return <ModelCard model={model} key={`model-${model.id}`} />;
          })}
        </RecentlyViewedModelsGrid>
      </DelayedLoadingAndErrorWrapper>
    </>
  );
};

export const RecentlyViewedModelsHeader = ({ id }: { id: string }) => (
  <Text fw="bold" size={16} color="text-dark" id={id}>
    Recents
  </Text>
);
