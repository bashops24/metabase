import type { Location } from "history";
import { useEffect } from "react";
import { replace } from "react-router-redux";
import _ from "underscore";

import { IS_EMBED_PREVIEW } from "metabase/lib/embed";
import { useDispatch } from "metabase/lib/redux";
import { isNotNull } from "metabase/lib/types";
import { extractQueryParams } from "metabase/lib/urls";

const QUERY_PARAMS_ALLOW_LIST = ["objectId", "tab"];

export const useSyncedQueryString = ({
  location,
  object,
}: {
  location: Location;
  object: Record<string, unknown>;
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    /**
     * We don't want to sync the query string to the URL because when previewing,
     * this changes the URL of the iframe by appending the query string to the src.
     * This causes the iframe to reload when changing the preview hash from appearance
     * settings because now the base URL (including the query string) is different.
     */
    if (IS_EMBED_PREVIEW) {
      return;
    }

    const newLocationObject = {
      ..._.pick(location.query, QUERY_PARAMS_ALLOW_LIST),
      ..._.pick(object, isNotNull),
    };

    if (
      !_.isEqual(
        extractQueryParams(newLocationObject).sort(),
        extractQueryParams(location.query).sort(),
      )
    ) {
      dispatch(
        replace({
          ...location,
          query: newLocationObject,
        }),
      );
    }
  }, [dispatch, location, object]);
};
